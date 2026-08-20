import asyncio
from app.rag.embedder import embed_chunks, embed_query


async def main():
    chunks = [
        "The borrower shall maintain Net Debt to EBITDA below 3.5x, tested quarterly.",
        "This agreement is governed by the laws of the State of New York.",
    ]
    vectors = await embed_chunks(chunks)
    print(f"Embedded {len(vectors)} chunks")
    print(f"Each vector has {len(vectors[0])} dimensions")   # should be 768

    qvec = await embed_query("what is the leverage covenant?")
    print(f"Query vector has {len(qvec)} dimensions")         # should be 768


if __name__ == "__main__":
    asyncio.run(main())