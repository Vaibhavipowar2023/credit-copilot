"""Split the text into chunks for embedding.
Here i used recursive character text splitter chunking strategy
It split the documents as :
headers -> paragraphs -> lines -> sentences -> characters
"""
from langchain_text_splitters import RecursiveCharacterTextSplitter

SEPARATORS = ["\n## ", "\n# ", "\n\n", "\n", ". ", " ", ""]

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1200,
    chunk_overlap=150,
    separators=SEPARATORS,
)

def chunk_markdown(text: str) -> list[str]:
    return _splitter.split_text(text)