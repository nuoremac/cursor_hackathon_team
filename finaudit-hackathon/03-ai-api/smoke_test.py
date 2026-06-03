"""Standalone smoke test for the FinAudit AI API.

Runs all endpoints in-process (via FastAPI TestClient) so you can verify the
backend works end-to-end without starting a server or having any API key.

Usage:
    python smoke_test.py
"""

from __future__ import annotations

import json
import sys

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# Mirrors shared/demo-data/demo-transactions.csv (includes the planted anomalies).
DEMO_TRANSACTIONS = [
    {"date": "2026-05-01", "accountCode": "601", "description": "Achat materiel informatique", "vendor": "TechPro", "invoiceNumber": "INV-001", "debit": 500000, "credit": 0, "amount": 500000},
    {"date": "2026-05-02", "accountCode": "602", "description": "Prestation consultant", "vendor": "ConsultPlus", "invoiceNumber": "INV-002", "debit": 1200000, "credit": 0, "amount": 1200000},
    {"date": "2026-05-04", "accountCode": "", "description": "Paiement fournisseur inconnu", "vendor": "Unknown Vendor", "invoiceNumber": "INV-003", "debit": 300000, "credit": 0, "amount": 300000},
    {"date": "2026-05-04", "accountCode": "601", "description": "Achat materiel informatique", "vendor": "TechPro", "invoiceNumber": "INV-001", "debit": 500000, "credit": 0, "amount": 500000},
    {"date": "2026-05-09", "accountCode": "607", "description": "Achat licences annuelles", "vendor": "SoftCloud", "invoiceNumber": "INV-004", "debit": 2500000, "credit": 0, "amount": 2500000},
    {"date": "2026-05-10", "accountCode": "606", "description": "Paiement weekend urgent", "vendor": "FastService", "invoiceNumber": "INV-005", "debit": 800000, "credit": 0, "amount": 800000},
    {"date": "2026-05-12", "accountCode": "605", "description": "Frais de bureau", "vendor": "OfficePlus", "invoiceNumber": "INV-006", "debit": 85000, "credit": 0, "amount": 85000},
    {"date": "2026-05-13", "accountCode": "604", "description": "Correction ecriture negative", "vendor": "Internal Adjustment", "invoiceNumber": "INV-007", "debit": -150000, "credit": 0, "amount": -150000},
    {"date": "2026-05-14", "accountCode": "603", "description": "Paiement fournisseur rare", "vendor": "NewVendorX", "invoiceNumber": "INV-008", "debit": 1800000, "credit": 0, "amount": 1800000},
    {"date": "2026-05-15", "accountCode": "701", "description": "Vente prestation client", "vendor": "ClientA", "invoiceNumber": "SALE-001", "debit": 0, "credit": 900000, "amount": 900000},
]


def _section(title: str) -> None:
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)


def main() -> int:
    failures = 0

    _section("GET /health")
    r = client.get("/health")
    print(r.status_code, json.dumps(r.json(), indent=2))
    failures += 0 if r.status_code == 200 and r.json().get("status") == "ok" else 1

    _section("POST /explain (duplicate + large amount)")
    r = client.post(
        "/explain",
        json={
            "transaction": DEMO_TRANSACTIONS[3],
            "reasons": ["Duplicate invoice number", "Very large amount"],
        },
    )
    body = r.json()
    print(r.status_code, json.dumps(body, indent=2, ensure_ascii=False))
    failures += 0 if r.status_code == 200 and body.get("risk") in {"low", "medium", "high"} and body.get("explanation") else 1

    _section("POST /explain (no reasons — graceful)")
    r = client.post("/explain", json={"transaction": DEMO_TRANSACTIONS[6], "reasons": []})
    print(r.status_code, json.dumps(r.json(), indent=2, ensure_ascii=False))
    failures += 0 if r.status_code == 200 and r.json().get("explanation") else 1

    _section("POST /audit (Isolation Forest)")
    r = client.post("/audit", json={"transactions": DEMO_TRANSACTIONS})
    body = r.json()
    print(r.status_code, json.dumps(body, indent=2, ensure_ascii=False))
    ok = (
        r.status_code == 200
        and body.get("summary", {}).get("total_transactions") == len(DEMO_TRANSACTIONS)
        and "risk_distribution" in body
    )
    failures += 0 if ok else 1

    _section("RESULT")
    if failures == 0:
        print("ALL CHECKS PASSED ✓")
    else:
        print(f"{failures} CHECK(S) FAILED ✗")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
