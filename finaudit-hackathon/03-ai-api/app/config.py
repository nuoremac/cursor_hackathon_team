"""Environment configuration for the FinAudit AI backend.

Reads settings from a local ``.env`` file (if present) plus process
environment variables. Everything has a safe default so the API can boot
even with an empty environment — this is critical for a demo where we must
never crash because a key is missing.
"""

from __future__ import annotations

import os
from functools import lru_cache

try:
    # python-dotenv is optional at runtime; if it is missing we simply rely
    # on the real environment variables. We never want a missing dependency
    # to take down the demo.
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover - defensive only
    pass


class Settings:
    """Lightweight settings container (no heavy pydantic-settings dependency)."""

    def __init__(self) -> None:
        # LLM provider selection: "openai", "gemini", or "mock".
        self.llm_provider: str = os.getenv("LLM_PROVIDER", "openai").strip().lower()

        # API keys (optional). When absent we fall back to the mock AI.
        self.openai_api_key: str = os.getenv("OPENAI_API_KEY", "").strip()
        self.gemini_api_key: str = os.getenv("GEMINI_API_KEY", "").strip()

        # Model names — sensible, cheap, fast defaults for a demo.
        self.openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
        self.gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

        # Hard timeout (seconds) for any LLM call so the demo stays snappy.
        self.llm_timeout_seconds: float = _float_env("LLM_TIMEOUT_SECONDS", 12.0)

        # Generation controls — low temperature for deterministic audit output.
        self.llm_temperature: float = _float_env("LLM_TEMPERATURE", 0.1)
        self.llm_max_tokens: int = _int_env("LLM_MAX_TOKENS", 350)

        # CORS origins (comma separated). "*" by default for hackathon ease.
        self.cors_origins: list[str] = _csv_env("CORS_ORIGINS", "*")

    # ---- Derived helpers -------------------------------------------------

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def active_provider(self) -> str:
        """Resolve which provider will actually be used.

        Respects ``LLM_PROVIDER`` but degrades gracefully to whatever key is
        available, and finally to ``mock`` when no key is configured.
        """
        if self.llm_provider == "openai" and self.has_openai:
            return "openai"
        if self.llm_provider == "gemini" and self.has_gemini:
            return "gemini"
        # Provider requested but its key is missing — try the other one.
        if self.has_openai:
            return "openai"
        if self.has_gemini:
            return "gemini"
        return "mock"


def _float_env(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _csv_env(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor."""
    return Settings()
