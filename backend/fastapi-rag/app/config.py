"""Centralized application configuration.

All tunables and secrets are read from environment variables in one place so the
rest of the codebase can depend on a single, validated `settings` object instead
of scattered `os.getenv` calls with inconsistent defaults.
"""

import os
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


def _split_csv(value: str) -> List[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- OpenAI / RAG ---
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
    generation_model: str = os.getenv("GENERATION_MODEL", "gpt-4o-mini")
    rag_namespace: str = os.getenv("RAG_NAMESPACE", "miguel")
    top_k: int = int(os.getenv("TOP_K", "6"))
    # Hard upper bound on tokens billed per answer (cost guard).
    max_tokens: int = min(int(os.getenv("MAX_TOKENS", "600")), 1500)

    # --- ElevenLabs (server-side only; never sent to the browser) ---
    elevenlabs_api_key: str | None = os.getenv("ELEVENLABS_API_KEY")
    elevenlabs_voice_id: str = os.getenv("ELEVENLABS_VOICE_ID", "foB7BprNxwUpIFQmq811")
    elevenlabs_model: str = os.getenv("ELEVENLABS_MODEL", "eleven_multilingual_v2")
    elevenlabs_stt_model: str = os.getenv("ELEVENLABS_STT_MODEL", "scribe_v1")

    # --- CORS: explicit allow-list, no wildcard in production ---
    # Comma-separated list via CORS_ORIGINS; defaults cover the live site + local dev.
    cors_origins: List[str] = _split_csv(
        os.getenv(
            "CORS_ORIGINS",
            "https://mrparracho.github.io,"
            "http://localhost:3000,http://127.0.0.1:3000,"
            "http://localhost:8000,http://127.0.0.1:8000",
        )
    )

    # --- Rate limiting (per client IP) ---
    rate_limit_ask: str = os.getenv("RATE_LIMIT_ASK", "10/minute")
    rate_limit_tts: str = os.getenv("RATE_LIMIT_TTS", "20/minute")
    rate_limit_stt: str = os.getenv("RATE_LIMIT_STT", "20/minute")

    # Reject oversized inputs before they reach a paid API.
    max_question_chars: int = int(os.getenv("MAX_QUESTION_CHARS", "1000"))
    max_tts_chars: int = int(os.getenv("MAX_TTS_CHARS", "1500"))
    max_audio_bytes: int = int(os.getenv("MAX_AUDIO_BYTES", str(10 * 1024 * 1024)))


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
