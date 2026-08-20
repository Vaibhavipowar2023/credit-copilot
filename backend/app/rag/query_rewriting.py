"""
Query rewriting : Expands a vague question into a
retrieval-optimized query before it hits the vector search.

Here I used Groq api key for query rewriting
"""
from openai import AsyncOpenAI

from app.config import settings
from app.prompts.rewrite import REWRITE_SYSTEM

MODEL = "openai/gpt-oss-20b"

_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.groq_api_key,
)

# Expand a vague question into a good retrieval query
async def rewrite_query(question: str) -> str:
    response = await _client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": REWRITE_SYSTEM},
            {"role": "user", "content": question},
        ],
        temperature=0.1,
    )
    return response.choices[0].message.content.strip()
