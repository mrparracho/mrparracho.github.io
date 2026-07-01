"""Server-side ElevenLabs proxy.

The browser used to call ElevenLabs directly with the API key embedded in
client JavaScript. These helpers move every ElevenLabs call server-side so the
key stays in the backend environment and is never shipped to clients.
"""

import logging

import aiohttp

from .config import settings

logger = logging.getLogger("miguel-rag.elevenlabs")

_BASE = "https://api.elevenlabs.io/v1"
_TIMEOUT = aiohttp.ClientTimeout(total=60)


class ElevenLabsError(RuntimeError):
    """Raised when the upstream ElevenLabs API returns an error."""


def _require_key() -> str:
    if not settings.elevenlabs_api_key:
        raise ElevenLabsError("ElevenLabs API key not configured")
    return settings.elevenlabs_api_key


async def speech_to_text(audio_bytes: bytes, filename: str, content_type: str) -> str:
    """Transcribe recorded audio via ElevenLabs Scribe."""
    key = _require_key()
    form = aiohttp.FormData()
    form.add_field("file", audio_bytes, filename=filename, content_type=content_type)
    form.add_field("model_id", settings.elevenlabs_stt_model)

    async with aiohttp.ClientSession(timeout=_TIMEOUT) as session:
        async with session.post(
            f"{_BASE}/speech-to-text",
            data=form,
            headers={"xi-api-key": key},
        ) as resp:
            if resp.status != 200:
                detail = await resp.text()
                logger.warning("ElevenLabs STT failed: %s", resp.status)
                raise ElevenLabsError(f"STT upstream error {resp.status}: {detail[:200]}")
            payload = await resp.json()

    return payload.get("text") or payload.get("transcription") or ""


async def text_to_speech(text: str) -> bytes:
    """Synthesize speech for `text`, returning MP3 bytes."""
    key = _require_key()
    body = {
        "text": text,
        "model_id": settings.elevenlabs_model,
        "voice_settings": {
            "stability": 0.7,
            "similarity_boost": 0.7,
            "style": 0.0,
            "use_speaker_boost": True,
        },
    }

    async with aiohttp.ClientSession(timeout=_TIMEOUT) as session:
        async with session.post(
            f"{_BASE}/text-to-speech/{settings.elevenlabs_voice_id}",
            json=body,
            headers={"xi-api-key": key, "Accept": "audio/mpeg"},
        ) as resp:
            if resp.status != 200:
                detail = await resp.text()
                logger.warning("ElevenLabs TTS failed: %s", resp.status)
                raise ElevenLabsError(f"TTS upstream error {resp.status}: {detail[:200]}")
            return await resp.read()
