"""
Embedding : coverts the splitting chunks into vector forma
here i used jina embedding model : jina-embeddings-v3. dimensions : 768

We use two task types:
  retrieval.passage -> for embedding document chunks (at indexing time)
  retrieval.query   -> for embedding a user's search question (at query time)
Jina optimizes these differently, which improves retrieval quality.
"""
import  httpx

from app.config import settings

JINA_URL = "https://api.jina.ai/v1/embeddings"
MODEL = "jina-embeddings-v3"
DIMENSIONS = 768

async def _embed(texts: list[str], task: str) -> list[list[float]]:
    """Send a batch of texts to Jina, return a list of 768-dim vectors."""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.jina_api_key}",
    }
    payload = {
        "model": MODEL,
        "task": task,
        "dimensions": DIMENSIONS,
        "input": texts,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(JINA_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()["data"]
    # Jina returns items possibly out of order; sort by index to be safe.
    data.sort(key=lambda item: item["index"])
    return [item["embedding"] for item in data]


"""Embed document chunks (for storing in the DB)"""
async def embed_chunks(chunks: list[str]) -> list[list[float]]:
    return await _embed(chunks, task="retrieval.passage")

"""Embed a single search query"""
async def embed_query(query: str) -> list[float] :
    results = await _embed([query], task="retrieval.query")
    return results[0]