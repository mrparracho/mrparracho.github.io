import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from .db import get_pool
from .rag import retrieve, build_user_prompt, SYSTEM_PROMPT, GENERATION_MODEL
from openai import AsyncOpenAI

app = FastAPI(title="Miguel's RAG Assistant", version="1.0.0")
oclient = AsyncOpenAI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/ask")
async def ask(payload: dict):
    """Streaming endpoint for RAG-based question answering."""
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
        # Send context information
        yield "event: context\n".encode()
        yield f"data: {json.dumps({'snippets': contexts})}\n\n".encode()

        # Stream the response
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
        
        # Send completion event
        yield b"event: done\n"
        yield f"data: {{\"text\": {full!r}}}\n\n".encode()

    headers = {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": os.getenv("CORS_ORIGIN", "*")
    }
    return StreamingResponse(sse_stream(), headers=headers)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "miguel-rag"}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Miguel's RAG Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "POST /ask": "Streaming RAG question answering",
            "GET /health": "Health check",
            "GET /docs": "API documentation"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
