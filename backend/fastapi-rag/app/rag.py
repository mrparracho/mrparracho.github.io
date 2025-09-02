import re
from typing import List, Tuple
import os
from openai import AsyncOpenAI

from .chroma_db import chroma_manager

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
GENERATION_MODEL = os.getenv("GENERATION_MODEL", "gpt-4o-mini")
RAG_NAMESPACE = os.getenv("RAG_NAMESPACE", "miguel")
TOP_K = int(os.getenv("TOP_K", "6"))

client = AsyncOpenAI()

_sentence_splitter = re.compile(r"(?<=[.!?])\s+")


def chunk_markdown(text: str, max_len: int = 1000) -> List[str]:
    """Split markdown text into chunks based on sentences."""
    parts: List[str] = []
    buf = ""
    for s in _sentence_splitter.split(text.replace("\r", "")):
        if len((buf + " " + s).strip()) > max_len:
            if buf:
                parts.append(buf.strip())
            buf = s
        else:
            buf = (buf + " " + s).strip()
    if buf:
        parts.append(buf.strip())
    return parts


async def embed(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts."""
    resp = await client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [d.embedding for d in resp.data]


async def retrieve(query_text: str, top_k: int = TOP_K) -> List[Tuple[str, float]]:
    """Retrieve relevant documents using vector similarity search."""
    qvec = (await embed([query_text]))[0]
    
    # Use ChromaDB for vector similarity search
    results = await chroma_manager.search_similar(qvec, top_k)
    return results


SYSTEM_PROMPT = (
    "You are Miguel speaking in first person to recruiters. "
    "Be concise (10–25 seconds when spoken). Keep answers grounded in the provided context. "
    "If unsure, offer to follow up by email or phone call."
    "If no specific question is asked or the input is unclear, respond with: 'Sorry, I didn't get that'"
    "Tone: professional, confident, friendly."
)


def build_user_prompt(question: str, contexts: List[str]) -> str:
    """Build the user prompt with context for the LLM."""
    ctx = "\n\n".join(f"[[CTX {i+1}]]\n{c}" for i, c in enumerate(contexts))
    return f"Context:\n{ctx}\n\nQuestion: {question}\n\nAnswer as Miguel."