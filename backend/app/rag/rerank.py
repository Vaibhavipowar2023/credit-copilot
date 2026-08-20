"""
Reranking: reorder a candidate set by TRUE relevance using Cohere's reranker,
then keep the best few. Vector search shortlists fast; the reranker picks the winners.
"""
import cohere

from app.config import settings
from app.models import DocumentChunk

_cohere = cohere.AsyncClientV2(api_key=settings.cohere_api_key)
RERANK_MODEL = "rerank-v3.5"

# Reorder retrieved documents based by relevance to the question and return the best top_n
async def rerank(question: str, chunks: list[DocumentChunk], top_n: int = 5) -> list[DocumentChunk] :
    if not chunks:
        return []

    response = await _cohere.rerank(
        model=RERANK_MODEL,
        query=question,
        documents=[c.content for c in chunks],
        top_n=top_n,
    )
    return [chunks[r.index] for r in response.results]
