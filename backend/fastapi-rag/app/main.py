import json
import logging

from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse, HTMLResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .config import settings
from . import elevenlabs

# Load environment variables first
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("miguel-rag")

app = FastAPI(title="Miguel's RAG Assistant", version="1.1.0")

# --- Rate limiting (per client IP) ---
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return Response("Rate limit exceeded. Please slow down.", status_code=429)


# Check if OpenAI API key is available (lazy client lives in rag.py)
if not settings.openai_api_key:
    logger.warning("OPENAI_API_KEY not set; the /ask endpoint will be unavailable")
OPENAI_CONFIGURED = bool(settings.openai_api_key)

# --- CORS: explicit allow-list, no wildcard, no credentials ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=settings.max_question_chars)


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=settings.max_tts_chars)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy" if OPENAI_CONFIGURED else "degraded",
        "service": "miguel-rag",
        "openai_configured": OPENAI_CONFIGURED,
        "tts_configured": bool(settings.elevenlabs_api_key),
    }


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the portfolio chat interface HTML."""
    try:
        with open("portfolio_chat.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Portfolio chat interface not found</h1>", status_code=404)


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "message": "Miguel's RAG Assistant API",
        "version": "1.1.0",
        "vector_db": "ChromaDB (Local)",
        "openai_configured": OPENAI_CONFIGURED,
        "endpoints": {
            "POST /ask": "Streaming RAG question answering",
            "POST /tts": "Text-to-speech (ElevenLabs proxy)",
            "POST /stt": "Speech-to-text (ElevenLabs proxy)",
            "GET /health": "Health check",
            "GET /docs": "API documentation",
        },
    }


@app.post("/ask")
@limiter.limit(settings.rate_limit_ask)
async def ask(request: Request, payload: AskRequest):
    """Streaming endpoint for RAG-based question answering."""
    if not OPENAI_CONFIGURED:
        raise HTTPException(500, "OpenAI API key not configured.")

    question = payload.question

    try:
        logger.info("Processing question (%d chars)", len(question))

        from .rag import retrieve, build_user_prompt, SYSTEM_PROMPT, GENERATION_MODEL, get_client

        contexts = await retrieve(question)
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
            stream = await get_client().chat.completions.create(
                model=GENERATION_MODEL,
                messages=messages,
                temperature=0.4,
                stream=True,
                max_tokens=settings.max_tokens,
            )

            full = ""
            async for part in stream:
                token = part.choices[0].delta.content or ""
                if token:
                    full += token
                    yield b"event: token\n"
                    yield f"data: {{\"token\": {json.dumps(token)}}}\n\n".encode()

            logger.info("Generated response (%d chars)", len(full))
            yield b"event: done\n"
            yield f"data: {{\"text\": {json.dumps(full)}}}\n\n".encode()

        headers = {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        }
        return StreamingResponse(sse_stream(), headers=headers)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing question")
        raise HTTPException(500, f"Error processing question: {e}")


@app.post("/tts")
@limiter.limit(settings.rate_limit_tts)
async def tts(request: Request, payload: TTSRequest):
    """Proxy text-to-speech to ElevenLabs; returns MP3 audio."""
    if not settings.elevenlabs_api_key:
        raise HTTPException(503, "TTS not configured.")
    try:
        audio = await elevenlabs.text_to_speech(payload.text)
        return Response(content=audio, media_type="audio/mpeg")
    except elevenlabs.ElevenLabsError as e:
        raise HTTPException(502, str(e))


@app.post("/stt")
@limiter.limit(settings.rate_limit_stt)
async def stt(request: Request, file: UploadFile = File(...)):
    """Proxy speech-to-text to ElevenLabs; returns transcribed text."""
    if not settings.elevenlabs_api_key:
        raise HTTPException(503, "STT not configured.")

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(400, "Empty audio upload.")
    if len(audio_bytes) > settings.max_audio_bytes:
        raise HTTPException(413, "Audio file too large.")

    try:
        text = await elevenlabs.speech_to_text(
            audio_bytes,
            filename=file.filename or "recording.webm",
            content_type=file.content_type or "audio/webm",
        )
        return {"text": text}
    except elevenlabs.ElevenLabsError as e:
        raise HTTPException(502, str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
