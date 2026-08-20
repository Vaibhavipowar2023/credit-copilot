"""Quick test of the chunker. Run with: python -m test.chunker_test"""
import asyncio

from app.rag.parser import parse_pdf
from app.rag.chunker import chunk_markdown


async def main():
    with open("Data/SPV-Credit-Agt.pdf", "rb") as f:                 # <-- your real filename
        markdown = await parse_pdf(f.read(), "SPV-Credit-Agt.pdf")   # <-- and here

    chunks = chunk_markdown(markdown)

    print(f"Total markdown: {len(markdown)} chars")
    print(f"Split into {len(chunks)} chunks")
    print(f"Avg chunk size: {sum(len(c) for c in chunks) // len(chunks)} chars\n")

    for i, c in enumerate(chunks[:3]):
        print(f"--- chunk {i} ({len(c)} chars) ---")
        print(c[:300])
        print()


if __name__ == "__main__":
    asyncio.run(main())