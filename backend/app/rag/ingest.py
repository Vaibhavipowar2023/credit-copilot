"""Ingest a PDF
This file is chain together everything in the rag folder.
and then we save the vectors in postgres"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Document, DocumentChunk
from app.rag.parser import parse_pdf
from app.rag.chunker import chunk_markdown
from app.rag.embedder import embed_chunks

"""It will read the full pipeline for one PDF and save the results."""
async def ingest_pdf(
        session: AsyncSession,
        file_bytes: bytes,
        filename: str,
        loan_agreement_id: int,
) -> Document:
    #1. Parse the PDF into markdown
    markdown = await parse_pdf(file_bytes, filename)

    #2. Split it into chunks
    chunks = chunk_markdown(markdown)

    #3. embed every chunk into a 78 dim vector
    vectors = await embed_chunks(chunks)

    #4. Create the parent Document row
    document = Document(loan_agreement_id=loan_agreement_id, filename=filename)
    session.add(document)
    await session.flush() # flush so document.id is assigned

    #5. Create a Document chunk row for  each chunk + its vector
    for i, (text, vector) in enumerate(zip(chunks, vectors)):
        session.add(
            DocumentChunk(
                document_id=document.id,
                content=text,
                embedding=vector,
                chunk_index=i,
            )
        )

    await session.flush()
    await session.refresh(document)
    return document