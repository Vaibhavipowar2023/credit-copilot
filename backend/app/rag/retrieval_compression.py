"""Compression: Remove the redundant, noisy part from the retrieved documents
so the generator gets clean, focused context
here i use GROQ"""
from openai import AsyncOpenAI

from app.config import settings
from app.models import DocumentChunk
from app.prompts.compression import COMPRESSION_SYSTEM
MODEL = "openai/gpt-oss-20b"

_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.groq_api_key,
)

async def compress_chunk(question: str, text: str) -> str:
    """Return only the question-relevant parts of one chunk."""
    response = await _client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": COMPRESSION_SYSTEM },
            {"role": "user", "content": f"Question: {question}\n\nText:\n{text}"},
        ],
        temperature=0.0,
    )
    return response.choices[0].message.content.strip()