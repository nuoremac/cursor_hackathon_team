# FinAudit — AI / API Layer (Person 3)

> Theme 11 — Accounting Anomaly Detection
> The AI explanation + anomaly-intelligence backend for FinAudit.

This service is the **AI brain** of FinAudit. It does **not** own the
deterministic accounting rules (that is Person 2's rule engine). It adds:

1. **AI explanations** of suspicious transactions (`/explain`).
2. An **unsupervised anomaly-intelligence layer** (Isolation Forest, `/audit`).
3. **Robust fallback logic** so the demo **never fails** — if no API key, no
   internet, a timeout, or a provider error occurs, a **smart mock AI** takes
   over automatically and the response stays coherent and professional.

---

## 1. Architecture

```text
Frontend
   ↓
FastAPI API  (app/main.py)
   ↓
Rule results input  (reasons[] from Person 2's engine)
   ↓
Optional ML anomaly detection   (services/anomaly_model.py — Isolation Forest)
   ↓
LLM explanation layer           (services/llm_explainer.py — OpenAI / Gemini)
   ↓
Intelligent mock AI fallback    (services/mock_ai.py)
```

Folder layout:

```text
03-ai-api/
├── app/
│   ├── main.py            # FastAPI app, CORS, startup, global error handler
│   ├── config.py          # env config + provider resolution
│   ├── schemas.py         # Pydantic request/response models
│   ├── routers/
│   │   ├── health.py      # /health
│   │   ├── audit.py       # /audit  (summary + ML anomalies)
│   │   └── explain.py     # /explain (AI explanation)
│   └── services/
│       ├── anomaly_model.py   # Isolation Forest (bonus)
│       ├── llm_explainer.py   # real AI + automatic fallback
│       └── mock_ai.py         # smart template-based fallback
├── prompts/
│   └── audit_explanation_prompt.txt
├── requirements.txt
├── .env.example
├── run.sh
└── README.md
```

---

## 2. Setup & Installation

Requires **Python 3.10+** (tested on 3.12).

```bash
cd finaudit-hackathon/03-ai-api

# (recommended) create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# install dependencies
pip install -r requirements.txt
```

---

## 3. Environment variables

Copy `.env.example` to `.env`. **All variables are optional** — with an empty
file the API runs on the smart mock AI.

| Variable              | Default            | Description                                  |
| --------------------- | ------------------ | -------------------------------------------- |
| `LLM_PROVIDER`        | `openai`           | `openai`, `gemini`, or `mock`                |
| `OPENAI_API_KEY`      | _(empty)_          | Enables real OpenAI calls when set           |
| `OPENAI_MODEL`        | `gpt-4o-mini`      | OpenAI model name                            |
| `GEMINI_API_KEY`      | _(empty)_          | Enables real Gemini calls when set           |
| `GEMINI_MODEL`        | `gemini-1.5-flash` | Gemini model name                            |
| `LLM_TEMPERATURE`     | `0.1`              | Low temperature → deterministic output       |
| `LLM_MAX_TOKENS`      | `350`              | Keeps responses short for the demo           |
| `LLM_TIMEOUT_SECONDS` | `12`               | Hard timeout before falling back to the mock |
| `CORS_ORIGINS`        | `*`                | Comma-separated allowed origins              |

**Provider resolution** (in `config.py`): use the requested provider if its key
exists; otherwise use whichever key is present; otherwise fall back to `mock`.

---

## 4. How to run

```bash
# from 03-ai-api/
./run.sh
# or directly:
uvicorn app.main:app --reload --port 8000
```

Then open the interactive docs at **http://localhost:8000/docs**.

A quick end-to-end smoke test (no server restart needed):

```bash
python smoke_test.py
```

---

## 5. API reference & examples

### `GET|POST /health`

```json
{ "status": "ok", "provider": "mock", "version": "1.0.0" }
```

### `POST /explain`  ← most important endpoint

Tries real AI first, falls back to the smart mock automatically. **Never
crashes.**

Request:

```json
{
  "transaction": {
    "date": "2026-05-04",
    "accountCode": "601",
    "description": "Achat materiel informatique",
    "vendor": "TechPro",
    "invoiceNumber": "INV-001",
    "debit": 500000,
    "credit": 0,
    "amount": 500000
  },
  "reasons": ["Duplicate invoice number", "Very large amount"]
}
```

Response:

```json
{
  "risk": "high",
  "explanation": "This transaction with TechPro for 500,000 is flagged because the same invoice number appears more than once, which strongly suggests a duplicate payment or a double-booked entry; and the amount is significantly higher than typical transactions...",
  "recommendation": "Confirm whether the invoice was paid twice and reconcile it against the supplier statement; obtain the supporting contract or purchase order...",
  "source": "mock"
}
```

`source` tells the frontend whether `openai`, `gemini`, or `mock` produced the
answer.

### `POST /audit`

Runs the bonus Isolation Forest over the provided transactions and returns
aggregate metrics. (Deterministic rules are handled by Person 2's engine.)

Request:

```json
{
  "transactions": [
    { "date": "2026-05-01", "accountCode": "601", "vendor": "TechPro", "invoiceNumber": "INV-001", "debit": 500000, "credit": 0, "amount": 500000 }
  ]
}
```

Response:

```json
{
  "summary": {
    "total_transactions": 10,
    "total_debit": 8635000,
    "total_credit": 900000,
    "balance_difference": 7735000,
    "ml_anomaly_count": 2
  },
  "ml_anomalies": [
    { "index": 8, "transaction_id": null, "invoice_number": "INV-008", "vendor": "NewVendorX", "amount": 1800000, "anomaly_score": 0.91, "is_anomaly": true }
  ],
  "risk_distribution": { "high": 1, "medium": 1, "low": 0, "normal": 8 }
}
```

> Note: ML detection needs at least 5 transactions; below that it returns an
> empty `ml_anomalies` list (by design, never an error).

---

## 6. Fallback behaviour (why the demo can't break)

The smart mock AI in `services/mock_ai.py` maps detected reasons (duplicate
invoice, missing account code, large/negative amount, weekend, rare vendor,
debit/credit imbalance, round amount, ML outlier) to professional explanations
and recommendations, combines multiple reasons naturally, and derives the risk
level from the strongest signal.

The fallback triggers automatically when:

- no API key is configured,
- the LLM SDK is not installed,
- the network/provider is unavailable,
- the call times out or is rate-limited,
- the model returns malformed / non-JSON output.

Even a totally unexpected error is caught by the router and the global
exception handler, which still return a valid response.

---

## 7. AI provider setup

**OpenAI**

```bash
echo "LLM_PROVIDER=openai"          >> .env
echo "OPENAI_API_KEY=sk-..."        >> .env
```

**Gemini**

```bash
echo "LLM_PROVIDER=gemini"          >> .env
echo "GEMINI_API_KEY=AIza..."       >> .env
```

The prompt (`prompts/audit_explanation_prompt.txt`) instructs the model to act
as a professional audit assistant, stay concise, avoid hallucinations, and
return **only** JSON: `{ "risk", "explanation", "recommendation" }`. We use low
temperature and JSON-mode for deterministic, structured output.

---

## 8. Frontend integration contract

- Call `POST /explain` with `{ transaction, reasons }` behind the
  **"Explain anomalies with AI"** button. Always renders something usable.
- Optionally call `POST /audit` with `{ transactions }` to enrich the dashboard
  with the unsupervised anomaly signal and risk distribution.
- Field names accept both camelCase (`accountCode`, `invoiceNumber`) and
  snake_case.
