"""Unsupervised anomaly detection (bonus) using Isolation Forest.

This is deliberately lightweight and stateless: we fit a fresh model on each
request over the transactions provided. There is NO training pipeline, NO
persistence, NO deep learning — just a fast, credible statistical signal that
complements the deterministic rule engine.

Features used per transaction:
    - amount
    - debit
    - credit
    - vendor_frequency   (how often the vendor appears)
    - weekday            (0=Mon .. 6=Sun)
    - account_frequency  (how often the account code appears)

Like everything else here, it degrades gracefully: if scikit-learn is missing
or anything fails, we return no anomalies instead of crashing.
"""

from __future__ import annotations

import logging
from collections import Counter
from datetime import datetime

from ..schemas import MLAnomaly, Transaction

logger = logging.getLogger("finaudit.ml")

# Need a few points for the model to be meaningful.
_MIN_TRANSACTIONS = 5
# Expected fraction of anomalies — keeps the model honest on small demo sets.
_CONTAMINATION = 0.2


def _parse_weekday(date_str: str | None) -> int:
    """Return weekday index (0-6); 0 (Monday) as a safe default."""
    if not date_str:
        return 0
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(date_str.strip(), fmt).weekday()
        except (ValueError, AttributeError):
            continue
    return 0


def _build_features(transactions: list[Transaction]) -> list[list[float]]:
    vendor_counts = Counter(
        (tx.vendor or "").strip().lower() for tx in transactions
    )
    account_counts = Counter(
        (tx.account_code or "").strip().lower() for tx in transactions
    )

    features: list[list[float]] = []
    for tx in transactions:
        vendor_key = (tx.vendor or "").strip().lower()
        account_key = (tx.account_code or "").strip().lower()
        features.append(
            [
                float(tx.amount or 0.0),
                float(tx.debit or 0.0),
                float(tx.credit or 0.0),
                float(vendor_counts.get(vendor_key, 0)),
                float(_parse_weekday(tx.date)),
                float(account_counts.get(account_key, 0)),
            ]
        )
    return features


def detect_anomalies(transactions: list[Transaction]) -> list[MLAnomaly]:
    """Run Isolation Forest and return per-transaction anomaly results.

    Returns an empty list (never raises) when detection is not possible.
    """
    if len(transactions) < _MIN_TRANSACTIONS:
        logger.info(
            "Only %d transactions (<%d) — skipping ML detection.",
            len(transactions),
            _MIN_TRANSACTIONS,
        )
        return []

    try:
        import numpy as np  # type: ignore
        from sklearn.ensemble import IsolationForest  # type: ignore
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("scikit-learn/numpy unavailable (%s) — skipping ML detection.", exc)
        return []

    try:
        features = np.array(_build_features(transactions), dtype=float)

        model = IsolationForest(
            n_estimators=100,
            contamination=_CONTAMINATION,
            random_state=42,
        )
        model.fit(features)

        predictions = model.predict(features)  # 1 = normal, -1 = anomaly
        # decision_function: higher = more normal. Convert to 0..1 anomaly score.
        raw_scores = model.decision_function(features)
        scores = _normalise_scores(raw_scores)

        results: list[MLAnomaly] = []
        for idx, tx in enumerate(transactions):
            results.append(
                MLAnomaly(
                    index=idx,
                    transaction_id=tx.id,
                    invoice_number=tx.invoice_number,
                    vendor=tx.vendor,
                    amount=float(tx.amount or 0.0),
                    anomaly_score=round(float(scores[idx]), 4),
                    is_anomaly=bool(predictions[idx] == -1),
                )
            )
        return results
    except Exception as exc:  # noqa: BLE001 - never break the demo
        logger.warning("ML detection failed (%s) — returning no anomalies.", exc)
        return []


def _normalise_scores(raw_scores) -> list[float]:
    """Map raw decision scores to a 0..1 anomaly score (1 = most anomalous)."""
    import numpy as np  # type: ignore

    raw = np.asarray(raw_scores, dtype=float)
    # Invert: lower decision_function => more anomalous => higher score.
    inverted = -raw
    lo, hi = float(inverted.min()), float(inverted.max())
    if hi - lo < 1e-9:
        return [0.5 for _ in raw]
    return ((inverted - lo) / (hi - lo)).tolist()
