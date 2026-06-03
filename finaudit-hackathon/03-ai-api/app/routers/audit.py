"""/audit endpoint — summary metrics + bonus ML anomaly detection.

The deterministic rule engine lives elsewhere (Person 2). This endpoint adds
the unsupervised intelligence layer and aggregate metrics on top of the raw
transactions so the frontend can show a richer dashboard.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from ..schemas import AuditRequest, AuditResponse, AuditSummary
from ..services.anomaly_model import detect_anomalies

logger = logging.getLogger("finaudit.audit")

router = APIRouter(tags=["audit"])

# Score thresholds used to bucket ML-flagged transactions into risk levels.
_HIGH_SCORE = 0.75
_MEDIUM_SCORE = 0.5


@router.post("/audit", response_model=AuditResponse)
def audit(request: AuditRequest) -> AuditResponse:
    transactions = request.transactions

    total_debit = sum(float(tx.debit or 0.0) for tx in transactions)
    total_credit = sum(float(tx.credit or 0.0) for tx in transactions)

    try:
        ml_anomalies = detect_anomalies(transactions)
    except Exception as exc:  # noqa: BLE001 - never break the demo
        logger.error("ML detection raised unexpectedly: %s", exc)
        ml_anomalies = []

    anomaly_count = sum(1 for a in ml_anomalies if a.is_anomaly)

    summary = AuditSummary(
        total_transactions=len(transactions),
        total_debit=round(total_debit, 2),
        total_credit=round(total_credit, 2),
        balance_difference=round(total_debit - total_credit, 2),
        ml_anomaly_count=anomaly_count,
    )

    risk_distribution = _risk_distribution(ml_anomalies)

    return AuditResponse(
        summary=summary,
        ml_anomalies=ml_anomalies,
        risk_distribution=risk_distribution,
    )


def _risk_distribution(ml_anomalies) -> dict[str, int]:
    """Bucket transactions into high/medium/low/normal by ML anomaly score."""
    distribution = {"high": 0, "medium": 0, "low": 0, "normal": 0}
    for item in ml_anomalies:
        if not item.is_anomaly:
            distribution["normal"] += 1
        elif item.anomaly_score >= _HIGH_SCORE:
            distribution["high"] += 1
        elif item.anomaly_score >= _MEDIUM_SCORE:
            distribution["medium"] += 1
        else:
            distribution["low"] += 1
    return distribution
