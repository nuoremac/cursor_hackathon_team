"""FinAudit AI/API backend — FastAPI application entry point.

Run locally:
    uvicorn app.main:app --reload --port 8000

Architecture:
    Frontend -> FastAPI -> [Rule results input] -> Isolation Forest (bonus)
             -> LLM explanation layer -> intelligent mock fallback
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import __version__
from .config import get_settings
from .routers import audit, explain, health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("finaudit")

app = FastAPI(
    title="FinAudit AI API",
    description=(
        "AI explanation and anomaly-intelligence layer for FinAudit "
        "(Theme 11 — Accounting Anomaly Detection)."
    ),
    version=__version__,
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(audit.router)
app.include_router(explain.router)


@app.on_event("startup")
def _log_startup() -> None:
    logger.info("FinAudit AI API v%s starting up.", __version__)
    logger.info("Active LLM provider: %s", settings.active_provider)
    if settings.active_provider == "mock":
        logger.info("No LLM key configured — using the smart mock AI fallback.")


@app.exception_handler(Exception)
async def _global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all so an unexpected error returns clean JSON instead of a 500
    stack trace during the demo."""
    logger.error("Unhandled error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=200,
        content={
            "error": "An internal error occurred but was handled gracefully.",
            "detail": str(exc),
        },
    )


@app.get("/", tags=["root"])
def root() -> dict:
    return {
        "name": "FinAudit AI API",
        "version": __version__,
        "provider": settings.active_provider,
        "endpoints": ["/health", "/audit", "/explain", "/docs"],
    }
