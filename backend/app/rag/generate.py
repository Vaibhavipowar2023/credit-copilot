"""Generation: given a question + retrieved chunks, ask the LLM to answer from them."""
from mistralai.client import Mistral

from app.config import settings
from app.models import DocumentChunk
from app.prompts.answer import ANSWER_SYSTEM, build_answer_prompt

MODEL = "open-mistral-nemo"


def _build_context(chunks: list[DocumentChunk]) -> str:
    return "\n\n".join(f"[Clause {i + 1}]\n{c.content}" for i, c in enumerate(chunks))


async def generate_answer(question: str, chunks: list[DocumentChunk]) -> str:
    context = _build_context(chunks)
    user_message = build_answer_prompt(context, question)

    async with Mistral(api_key=settings.mistral_api_key) as client:
        response = await client.chat.complete_async(
            model=MODEL,
            messages=[
                {"role": "system", "content": ANSWER_SYSTEM},
                {"role": "user", "content": user_message},
            ],
            temperature=0.1,
            max_tokens=800,
        )
    return response.choices[0].message.content