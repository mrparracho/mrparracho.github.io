import re
from typing import List, Tuple

from openai import AsyncOpenAI

from .config import settings
from .chroma_db import chroma_manager

EMBEDDING_MODEL = settings.embedding_model
GENERATION_MODEL = settings.generation_model
RAG_NAMESPACE = settings.rag_namespace
TOP_K = settings.top_k

_sentence_splitter = re.compile(r"(?<=[.!?])\s+")

# Created lazily so importing this module does not require an API key to be set
# (keeps imports cheap and lets the app boot in a degraded/health-only mode).
_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI()
    return _client


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
    resp = await get_client().embeddings.create(model=EMBEDDING_MODEL, input=texts)
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
    "If unsure about the question, offer to follow up by email or phone call. "
    "Tone: professional, confident, friendly. "
    "Never respond with 'Sorry, I didn't get that' unless the input is completely unclear, nonsensical, or contains no actual question."
)


def build_user_prompt(question: str, contexts: List[str]) -> str:
    """Build the user prompt with context for the LLM."""
    ctx = "\n\n".join(f"[[CTX {i+1}]]\n{c}" for i, c in enumerate(contexts))
    return f"Context:\n{ctx}\n\nQuestion: {question}\n\nAnswer as Miguel."
