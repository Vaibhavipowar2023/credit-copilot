"""
Extract covenants: It extracts covenants from a documents chunks using
the LLM, return structured data.
"""
import json
from openai import AsyncOpenAI

from app.config import settings
from app.prompts.extraction import EXTRACTION_SYSTEM

MODEL = "openai/gpt-oss-120b"

_client = AsyncOpenAI(base_url="https://api.groq.com/openai/v1", api_key=settings.groq_api_key)


"""Send agreement text to the LLM.
Return a list of covenant dicts."""
async def extract_covenants(text:str) -> list[dict] :
    response = await  _client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM},
            {"role": "user", "content": text},
        ],
        temperature=0.0,
        response_format={"type": "json_object"},
    )
    raw = response.choices[0].message.content
    data=json.loads(raw)

    # Model may wrap the array in a key; handle both shapes
    return data if isinstance(data, list) else data.get("covenants", data.get("items", []))