"""Smart mock AI fallback.

When no LLM provider is configured (or the call fails / times out), we still
return a credible, professional, audit-flavoured explanation. The output is
generated from the detected rule reasons + transaction context, so it reads
like a real assistant rather than a static placeholder.

This is the safety net that guarantees the demo NEVER fails.
"""

from __future__ import annotations

import re

from ..schemas import ExplainResponse, Transaction

# Map a normalised reason keyword to (risk_weight, explanation, recommendation).
# risk_weight: 3 = high, 2 = medium, 1 = low.
_REASON_LIBRARY: list[tuple[list[str], int, str, str]] = [
    (
        ["duplicate", "duplicat", "doublon"],
        3,
        "the same invoice number appears more than once, which strongly suggests a duplicate payment or a double-booked entry",
        "confirm whether the invoice was paid twice and reconcile it against the supplier statement and bank records",
    ),
    (
        ["negative", "negatif", "négatif"],
        3,
        "the amount is negative, which is unusual for a standard expense entry and may indicate a manual correction or reversal",
        "trace the original entry being corrected and verify that the adjustment is authorised and documented",
    ),
    (
        ["large", "high amount", "montant eleve", "montant élevé", "very large", "gros montant"],
        3,
        "the amount is significantly higher than typical transactions, increasing the financial exposure if it is incorrect",
        "obtain the supporting contract or purchase order and confirm the approval chain for this expenditure",
    ),
    (
        ["imbalance", "debit/credit", "balance", "desequilibre", "déséquilibre"],
        3,
        "the debit and credit sides do not balance, which breaks the fundamental double-entry accounting principle",
        "review the journal entry and ensure debits equal credits before the period is closed",
    ),
    (
        ["rare vendor", "rare", "new vendor", "fournisseur rare", "unknown vendor"],
        3,
        "the counterparty appears only once and is associated with a large amount, a common pattern for fictitious or one-off suppliers",
        "validate that the vendor is legitimate and properly onboarded before approving the payment",
    ),
    (
        ["missing account", "account code", "compte manquant", "missing code"],
        2,
        "the account code is missing, so the entry is incomplete and cannot be correctly classified in the ledger",
        "assign the correct account code and confirm the entry is posted to the appropriate ledger",
    ),
    (
        ["weekend", "week-end", "saturday", "sunday"],
        2,
        "the transaction was recorded on a weekend, which is operationally unusual and can indicate out-of-process activity",
        "check why the entry was posted outside business days and who authorised it",
    ),
    (
        ["round", "rond"],
        1,
        "the amount is a suspiciously round figure, which can occasionally signal an estimated or fabricated value",
        "match the amount to an actual invoice to confirm it reflects a real, precise charge",
    ),
    (
        ["anomaly score", "isolation forest", "ml", "atypical", "atypique", "outlier"],
        2,
        "the unsupervised model flagged this entry as statistically atypical compared with the rest of the dataset",
        "review the transaction details manually, as it deviates from the normal pattern of activity",
    ),
]

_RISK_LABEL = {1: "low", 2: "medium", 3: "high"}


def _normalise(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _match_reason(reason: str) -> tuple[int, str, str] | None:
    norm = _normalise(reason)
    for keywords, weight, explanation, recommendation in _REASON_LIBRARY:
        if any(kw in norm for kw in keywords):
            return weight, explanation, recommendation
    return None


def generate_mock_explanation(
    transaction: Transaction, reasons: list[str]
) -> ExplainResponse:
    """Build a coherent explanation from matched (or generic) reasons."""

    matched: list[tuple[int, str, str]] = []
    for reason in reasons or []:
        hit = _match_reason(reason)
        if hit:
            matched.append(hit)

    vendor = transaction.vendor or "the counterparty"
    amount = transaction.amount or 0.0

    if not matched:
        # No recognised reason — produce a safe, generic but professional note.
        risk = "medium" if reasons else "low"
        joined = "; ".join(reasons) if reasons else "general review flags"
        explanation = (
            f"This transaction with {vendor} for an amount of {amount:,.0f} was "
            f"flagged for review ({joined}). It departs from the expected pattern "
            "and warrants a manual check."
        )
        recommendation = (
            "Verify the supporting documentation and confirm the entry is accurate "
            "and properly authorised."
        )
        return ExplainResponse(
            risk=risk,
            explanation=explanation,
            recommendation=recommendation,
            source="mock",
        )

    # Highest weight drives the overall risk level.
    max_weight = max(weight for weight, _, _ in matched)
    risk = _RISK_LABEL[max_weight]

    # Compose explanation: lead sentence + the matched reason clauses.
    clauses = [explanation for _, explanation, _ in matched]
    if len(clauses) == 1:
        body = clauses[0]
    else:
        body = "; ".join(clauses[:-1]) + f"; and {clauses[-1]}"

    explanation = (
        f"This transaction with {vendor} for {amount:,.0f} is flagged because {body}."
    )

    # De-duplicate recommendations while preserving order.
    seen: set[str] = set()
    recs: list[str] = []
    for _, _, rec in matched:
        if rec not in seen:
            seen.add(rec)
            recs.append(rec)
    recommendation = _join_recommendations(recs)

    return ExplainResponse(
        risk=risk,
        explanation=explanation,
        recommendation=recommendation,
        source="mock",
    )


def _join_recommendations(recs: list[str]) -> str:
    if not recs:
        return "Review the entry and confirm it is accurate and authorised."
    # Capitalise the first word and join into a single directive sentence.
    text = "; ".join(recs)
    text = text[0].upper() + text[1:]
    if not text.endswith("."):
        text += "."
    return text
