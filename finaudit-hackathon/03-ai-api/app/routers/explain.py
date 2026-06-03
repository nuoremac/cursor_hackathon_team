"""/explain endpoint — the most important one.

Returns an AI-generated (or smart-mock) audit explanation. It is wrapped so
that it can never crash the demo: any unexpected error still yields a valid
ExplainResponse.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from ..schemas import ExplainRequest, ExplainResponse
from ..services.llm_explainer import explain_transaction
from ..services.mock_ai import generate_mock_explanation

logger = logging.getLogger("finaudit.explain")

router = APIRouter(tags=["explain"])


@router.post("/explain", response_model=ExplainResponse)
def explain(request: ExplainRequest) -> ExplainResponse:
    try:
        return explain_transaction(request.transaction, request.reasons)
    except Exception as exc:  # noqa: BLE001 - last-resort safety net
        logger.error("Unexpected error in /explain: %s", exc)
        try:
            return generate_mock_explanation(request.transaction, request.reasons)
        except Exception:  # pragma: no cover - truly defensive
            return ExplainResponse(
                risk="medium",
                explanation="This transaction was flagged for manual review.",
                recommendation="Verify the supporting documentation and approvals.",
                source="mock",
            )
