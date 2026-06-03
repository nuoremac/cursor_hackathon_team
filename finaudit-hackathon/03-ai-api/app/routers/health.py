"""Health check endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from .. import __version__
from ..config import get_settings
from ..schemas import HealthResponse

router = APIRouter(tags=["health"])


def _health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        provider=settings.active_provider,
        version=__version__,
    )


# Support both GET (browser-friendly) and POST (as specified in the brief).
@router.get("/health", response_model=HealthResponse)
def health_get() -> HealthResponse:
    return _health()


@router.post("/health", response_model=HealthResponse)
def health_post() -> HealthResponse:
    return _health()
