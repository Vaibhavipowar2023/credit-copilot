"""Retrieval : User given a question, it find the most semantically similar chunks.
Flow : embed the question -> pgvector nearest neighbour search -> return top chunks"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import DocumentChunk
from app.rag.embedder import embed_query

"""Return the top_k chunks most similar in meaning to the question."""
async def retrieve(session: AsyncSession, question: str, top_k: int = 5) -> list[DocumentChunk]:
    # 1. turn the question into a vector (same 768-dim space as the chunks)
    query_vector = await embed_query(question)

    # 2. ask pgvector for the nearest chunks by cosine distance.
    #.cosine_distance() maps to pgvector's <=> operator.
    stmt = (
        select(DocumentChunk)
        .order_by(DocumentChunk.embedding.cosine_distance(query_vector))
        .limit(top_k)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())