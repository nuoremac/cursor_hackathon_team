"""Pydantic request/response models for the FinAudit AI backend.

The frontend sends transactions in camelCase (``accountCode``,
``invoiceNumber``). We accept both camelCase and snake_case via field
aliases and allow extra fields so a slightly different payload never breaks
the demo.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

RiskLevel = str  # "low" | "medium" | "high"


class Transaction(BaseModel):
    """A single accounting transaction line.

    Tolerant by design: every field is optional and unknown fields are kept,
    because hackathon CSVs are messy and we must never reject input.
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: Optional[str] = None
    date: Optional[str] = None
    account_code: Optional[str] = Field(default=None, alias="accountCode")
    description: Optional[str] = None
    vendor: Optional[str] = None
    invoice_number: Optional[str] = Field(default=None, alias="invoiceNumber")
    debit: float = 0.0
    credit: float = 0.0
    amount: float = 0.0


# ---- /audit ------------------------------------------------------------


class AuditRequest(BaseModel):
    transactions: list[Transaction] = Field(default_factory=list)


class MLAnomaly(BaseModel):
    """One transaction flagged by the unsupervised model."""

    index: int
    transaction_id: Optional[str] = None
    invoice_number: Optional[str] = None
    vendor: Optional[str] = None
    amount: float = 0.0
    anomaly_score: float  # higher = more anomalous (0..1)
    is_anomaly: bool


class AuditSummary(BaseModel):
    total_transactions: int = 0
    total_debit: float = 0.0
    total_credit: float = 0.0
    balance_difference: float = 0.0
    ml_anomaly_count: int = 0


class AuditResponse(BaseModel):
    summary: AuditSummary
    ml_anomalies: list[MLAnomaly] = Field(default_factory=list)
    risk_distribution: dict[str, int] = Field(default_factory=dict)


# ---- /explain ----------------------------------------------------------


class ExplainRequest(BaseModel):
    """Request for an AI explanation of a single suspicious transaction."""

    model_config = ConfigDict(populate_by_name=True)

    transaction: Transaction = Field(default_factory=Transaction)
    reasons: list[str] = Field(default_factory=list)


class ExplainResponse(BaseModel):
    risk: RiskLevel = "medium"
    explanation: str = ""
    recommendation: str = ""
    # Tells the frontend (and judges) whether real AI or the fallback ran.
    source: str = "mock"  # "openai" | "gemini" | "mock"


# ---- misc --------------------------------------------------------------


class HealthResponse(BaseModel):
    status: str = "ok"
    provider: str = "mock"
    version: str = "1.0.0"


def transaction_to_prompt_dict(tx: Transaction) -> dict[str, Any]:
    """Compact, human-readable dict used inside the LLM prompt."""
    return {
        "date": tx.date,
        "accountCode": tx.account_code,
        "description": tx.description,
        "vendor": tx.vendor,
        "invoiceNumber": tx.invoice_number,
        "debit": tx.debit,
        "credit": tx.credit,
        "amount": tx.amount,
    }
