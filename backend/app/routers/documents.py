"""Upload a PDF for a loan : it gets parsed, chunked, embedded and stored """

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import LoanAgreement
from app.rag.ingest import ingest_pdf
from app.schemas import DocumentRead, SearchResult, AskResponse
from pydantic import BaseModel
from app.rag.retrieve import retrieve
from app.rag.rerank import rerank
from app.rag.query_rewriting import rewrite_query
from app.rag.retrieval_compression import compress_chunk
from app.rag.generate import generate_answer
from app.models import Document, DocumentChunk, Covenant
from app.rag.extract import extract_covenants
from sqlalchemy import select

from app.auth import get_current_user
from app.models import User


router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/", response_model=list[DocumentRead])
async def list_documents(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list:
    """Return every uploaded document, newest first, with chunk counts."""
    from sqlalchemy import func as sa_func

    try:
        stmt = (
            select(
                Document.id,
                Document.loan_agreement_id,
                Document.filename,
                Document.created_at,
                sa_func.count(DocumentChunk.id).label("chunk_count"),
            )
            .outerjoin(DocumentChunk, DocumentChunk.document_id == Document.id)
            .group_by(Document.id, Document.loan_agreement_id, Document.filename, Document.created_at)
            .order_by(Document.created_at.desc())
        )
        rows = (await session.execute(stmt)).all()
        print(f"[documents] Found {len(rows)} documents")
        return [
            DocumentRead(
                id=r.id,
                loan_agreement_id=r.loan_agreement_id,
                filename=r.filename,
                created_at=r.created_at.isoformat() if r.created_at else None,
                chunk_count=r.chunk_count,
            )
            for r in rows
        ]
    except Exception as e:
        print(f"[documents] ERROR listing documents: {e}")
        # Fallback: simple query without chunk counts
        stmt = select(Document).order_by(Document.created_at.desc())
        rows = (await session.execute(stmt)).scalars().all()
        print(f"[documents] Fallback found {len(rows)} documents")
        return [
            DocumentRead(
                id=r.id,
                loan_agreement_id=r.loan_agreement_id,
                filename=r.filename,
                created_at=r.created_at.isoformat() if r.created_at else None,
                chunk_count=None,
            )
            for r in rows
        ]


@router.post("/upload", response_model=DocumentRead, status_code=201)
async def upload_document(
    loan_agreement_id: int,
    user: User = Depends(get_current_user),
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
) -> object:
    print(f"[documents] POST /upload called: loan_agreement_id={loan_agreement_id}, file={file.filename}, size={file.size}")
    # guard: the loan must exist
    loan = await session.get(LoanAgreement, loan_agreement_id)
    if loan is None:
        print(f"[documents] Loan {loan_agreement_id} not found")
        raise HTTPException(status_code=404, detail="Loan not found")

    try:
        file_bytes = await file.read()
        print(f"[documents] Read {len(file_bytes)} bytes, starting ingest...")
        document = await ingest_pdf(session, file_bytes, file.filename, loan_agreement_id)
        print(f"[documents] Ingest complete: doc id={document.id}")
        return document
    except Exception as e:
        print(f"[documents] ERROR during upload/ingest: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.get("/search")
async def search_documents(
        q:str,
        user: User = Depends(get_current_user),
        top_k:int = 5,
        session: AsyncSession = Depends(get_session)
) -> list[SearchResult]:
    chunks = await retrieve(session, q, top_k)
    return [SearchResult(chunk_index=c.chunk_index, content=c.content) for c in chunks]

@router.get("/ask")
async def ask_document(
    q: str,
    user: User = Depends(get_current_user),
    top_k: int = 5,
    session: AsyncSession = Depends(get_session),
) -> AskResponse:
    search_query = await rewrite_query(q)                       # rewrite
    candidates = await retrieve(session, search_query, top_k=20)  # retrieve 20
    chunks = await rerank(q, candidates, top_n=top_k)            # rerank to best 5

    # compress each chunk down to question-relevant parts
    for c in chunks:
        c.content = await compress_chunk(q, c.content)
    chunks = [c for c in chunks if c.content]                    # drop any that came back empty

    answer = await generate_answer(q, chunks)                   # generate
    sources = [SearchResult(chunk_index=c.chunk_index, content=c.content) for c in chunks]
    return AskResponse(answer=answer, sources=sources)

# Extract the covenants
@router.post("/{document_id}/extract_covenants")
async def extract_document_covenants(
        document_id: int,
        user: User = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
) -> dict:

    # Get the document and confirm it exists
    document = await session.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    # retrieve only covenant-relevant chunks (keeps us under the token limit)
    chunks = await retrieve(
        session,
        "affirmative and negative covenants, financial covenants, indebtedness, liens, restrictions",
        top_k=10,
    )
    full_text = "\n\n".join(c.content for c in chunks)

    # extract covenants via the LLM
    extracted = await extract_covenants(full_text)

    # save each one to the covenants table, tied to this document's loan
    saved = []
    for cov in extracted:
        if not isinstance(cov, dict):
            continue
        covenant = Covenant(
            loan_agreement_id=document.loan_agreement_id,
            metric=cov.get("metric", ""),
            operator=cov.get("operator"),
            threshold=cov.get("threshold"),
            unit=cov.get("unit"),
            source_quote=cov.get("source_quote"),
        )
        session.add(covenant)
        saved.append(cov)
    await session.flush()

    return {"document_id": document_id, "extracted_count": len(saved), "covenants": saved}

