# 📁 Project scaffold

"""
fastapi-rag/
├─ app/
│  ├─ main.py               # FastAPI app, SSE streaming endpoint
│  ├─ rag.py                # chunking, embeddings, retrieval, prompt
│  └─ db.py                 # asyncpg connection + helpers
├─ scripts/
│  ├─ schema.sql            # pgvector schema
│  └─ ingest.py             # load docs/*.md -> embeddings -> pg
├─ docs/
│  ├─ cv.md
│  ├─ projects.md
│  └─ faq.md
├─ .env                     # OPENAI_API_KEY, DATABASE_URL, etc.
├─ pyproject.toml
└─ README.md
"""

# -------------------------
# pyproject.toml
# -------------------------
# [build-system]
# requires = ["setuptools", "wheel"]
# build-backend = "setuptools.build_meta"
#
# [project]
# name = "fastapi-rag"
# version = "0.1.0"
# dependencies = [
#   "fastapi==0.111.0",
#   "uvicorn[standard]==0.30.1",
#   "httpx==0.27.0",
#   "python-dotenv==1.0.1",
#   "asyncpg==0.29.0",
#   "pgvector==0.2.5",
#   "markdown==3.6",
#   "openai==1.40.0"
# ]

# -------------------------
# scripts/schema.sql
# -------------------------
# CREATE EXTENSION IF NOT EXISTS vector;
# CREATE EXTENSION IF NOT EXISTS pgcrypto;
# CREATE TABLE IF NOT EXISTS documents (
#   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#   namespace TEXT NOT NULL,
#   doc_id TEXT NOT NULL,
#   chunk_id INT NOT NULL,
#   content TEXT NOT NULL,
#   metadata JSONB NOT NULL DEFAULT '{}',
#   embedding VECTOR(3072) NOT NULL
# );
# CREATE INDEX IF NOT EXISTS idx_documents_namespace ON documents(namespace);
# CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

# -------------------------
# app/db.py
# -------------------------
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    return _pool

# -------------------------
# app/rag.py
# -------------------------
import re
from typing import List, Tuple
import os
from openai import AsyncOpenAI

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
GENERATION_MODEL = os.getenv("GENERATION_MODEL", "gpt-4.1-mini")
RAG_NAMESPACE = os.getenv("RAG_NAMESPACE", "miguel")
TOP_K = int(os.getenv("TOP_K", "6"))

client = AsyncOpenAI()

_sentence_splitter = re.compile(r"(?<=[.!?])\s+")

def chunk_markdown(text: str, max_len: int = 1000) -> List[str]:
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
    resp = await client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [d.embedding for d in resp.data]

async def retrieve(pool, query_text: str, top_k: int = TOP_K) -> List[Tuple[str, float]]:
    qvec = (await embed([query_text]))[0]
    vec_literal = "[" + ",".join(str(x) for x in qvec) + "]"
    sql = (
        "SELECT content, 1 - (embedding <=> $1::vector) AS score "
        "FROM documents WHERE namespace = $2 "
        "ORDER BY embedding <-> $1::vector LIMIT $3"
    )
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, vec_literal, RAG_NAMESPACE, top_k)
    return [(r["content"], r["score"]) for r in rows]

SYSTEM_PROMPT = (
    "You are Miguel speaking in first person to recruiters. "
    "Be concise (10–25 seconds when spoken). Keep answers grounded in the provided context. "
    "If unsure, offer to follow up by email. Tone: professional, confident, friendly."
)

def build_user_prompt(question: str, contexts: List[str]) -> str:
    ctx = "\n\n".join(f"[[CTX {i+1}]]\n{c}" for i, c in enumerate(contexts))
    return f"Context:\n{ctx}\n\nQuestion: {question}\n\nAnswer as Miguel."

# -------------------------
# app/main.py
# -------------------------
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from .db import get_pool
from .rag import retrieve, build_user_prompt, SYSTEM_PROMPT, GENERATION_MODEL
from openai import AsyncOpenAI

app = FastAPI(title="Recruiter RAG (Python)")
oclient = AsyncOpenAI()

@app.post("/ask")
async def ask(payload: dict):
    question = (payload or {}).get("question")
    if not question:
        raise HTTPException(400, "Missing question")

    pool = await get_pool()
    contexts = await retrieve(pool, question)
    context_texts = [c for c, _ in contexts]

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": build_user_prompt(question, context_texts)},
    ]

    async def sse_stream():
        yield "event: context\n".encode()
        import json
        yield f"data: {json.dumps({"snippets": contexts})}\n\n".encode()

        stream = await oclient.chat.completions.create(
            model=GENERATION_MODEL,
            messages=messages,
            temperature=0.4,
            stream=True,
            max_tokens=int(os.getenv("MAX_TOKENS", "600")),
        )

        full = ""
        async for part in stream:
            token = part.choices[0].delta.content or ""
            if token:
                full += token
                yield b"event: token\n"
                yield f"data: {{\"token\": {token!r}}}\n\n".encode()
        yield b"event: done\n"
        yield f"data: {{\"text\": {full!r}}}\n\n".encode()

    headers = {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": os.getenv("CORS_ORIGIN", "*")
    }
    return StreamingResponse(sse_stream(), headers=headers)

# -------------------------
# scripts/ingest.py
# -------------------------
import os
import glob
import asyncio
from dotenv import load_dotenv
import asyncpg
from openai import AsyncOpenAI
from app.rag import chunk_markdown

load_dotenv()
client = AsyncOpenAI()
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
NAMESPACE = os.getenv("RAG_NAMESPACE", "miguel")
DATABASE_URL = os.getenv("DATABASE_URL")

aSYNC = asyncio.get_event_loop()

async def ensure_schema(conn):
    await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    await conn.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          namespace TEXT NOT NULL,
          doc_id TEXT NOT NULL,
          chunk_id INT NOT NULL,
          content TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}',
          embedding VECTOR(3072) NOT NULL
        )
        """
    )

async def embed(texts):
    resp = await client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [d.embedding for d in resp.data]

async def upsert(conn, doc_id, chunks, meta):
    vectors = await embed(chunks)
    for i, (c, v) in enumerate(zip(chunks, vectors)):
        vec_lit = "[" + ",".join(str(x) for x in v) + "]"
        await conn.execute(
            """
            INSERT INTO documents(namespace, doc_id, chunk_id, content, metadata, embedding)
            VALUES($1, $2, $3, $4, $5, $6::vector)
            ON CONFLICT DO NOTHING
            """,
            NAMESPACE, doc_id, i, c, meta, vec_lit
        )

async def main():
    conn = await asyncpg.connect(DATABASE_URL)
    await ensure_schema(conn)
    for path in glob.glob("docs/*.md"):
        with open(path, "r", encoding="utf-8") as f:
            raw = f.read()
        chunks = chunk_markdown(raw)
        meta = {"filename": os.path.basename(path)}
        await upsert(conn, os.path.splitext(os.path.basename(path))[0], chunks, meta)
        print(f"Ingested {path} -> {len(chunks)} chunks")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())

# -------------------------
# README (key commands)
# -------------------------
# 1) Create and fill .env with OPENAI_API_KEY and DATABASE_URL
# 2) Install deps: pip install -e .  (or: pip install fastapi uvicorn httpx python-dotenv asyncpg pgvector markdown openai)
# 3) Initialize DB: psql "$DATABASE_URL" -f scripts/schema.sql
# 4) Ingest: python scripts/ingest.py
# 5) Run API: uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips='*'
# 6) POST {"question": "What's your notice period?"} to /ask (SSE stream).
