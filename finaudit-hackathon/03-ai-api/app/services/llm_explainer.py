"""LLM explanation layer with automatic, graceful fallback.

Flow:
    1. Resolve the active provider from settings (openai / gemini / mock).
    2. Try the real LLM with a hard timeout and strict JSON parsing.
    3. On ANY failure (missing key, network, timeout, bad output, rate limit)
       silently fall back to the smart mock AI.

The public entry point :func:`explain_transaction` therefore NEVER raises and
ALWAYS returns a usable :class:`ExplainResponse`.
"""

from __future__ import annotations

import json
import logging
import os
import re
from functools import lru_cache

from ..config import get_settings
from ..schemas import ExplainResponse, Transaction, transaction_to_prompt_dict
from .mock_ai import generate_mock_explanation

logger = logging.getLogger("finaudit.llm")

_PROMPT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "prompts",
    "audit_explanation_prompt.txt",
)

_VALID_RISKS = {"low", "medium", "high"}


@lru_cache
def _load_prompt_template() -> str:
    """Load the prompt template once; fall back to an inline copy if missing."""
    try:
        with open(_PROMPT_PATH, "r", encoding="utf-8") as handle:
            return handle.read()
    except Exception:  # pragma: no cover - defensive
        logger.warning("Prompt file not found at %s, using inline template", _PROMPT_PATH)
        return (
            "You are a professional accounting audit assistant. Explain why the "
            "transaction is risky and what to verify. Return ONLY JSON with keys "
            "risk, explanation, recommendation.\n"
            "Transaction (JSON):\n{transaction_json}\n"
            "Detected rule reasons:\n{reasons}\n"
        )


def _build_prompt(transaction: Transaction, reasons: list[str]) -> str:
    template = _load_prompt_template()
    tx_json = json.dumps(transaction_to_prompt_dict(transaction), ensure_ascii=False)
    reasons_text = "\n".join(f"- {r}" for r in reasons) if reasons else "- (none provided)"
    # Use .replace instead of .format because the template contains literal
    # JSON braces that would otherwise confuse str.format.
    return template.replace("{transaction_json}", tx_json).replace(
        "{reasons}", reasons_text
    )


def explain_transaction(transaction: Transaction, reasons: list[str]) -> ExplainResponse:
    """Main entry point. Tries real AI, then falls back to the mock."""
    settings = get_settings()
    provider = settings.active_provider

    if provider == "mock":
        return generate_mock_explanation(transaction, reasons)

    prompt = _build_prompt(transaction, reasons)
    raw: str | None = None
    try:
        if provider == "openai":
            raw = _call_openai(prompt)
        elif provider == "gemini":
            raw = _call_gemini(prompt)
    except Exception as exc:  # noqa: BLE001 - we intentionally swallow everything
        logger.warning("LLM provider '%s' failed: %s. Falling back to mock.", provider, exc)
        raw = None

    if not raw:
        return generate_mock_explanation(transaction, reasons)

    parsed = _parse_llm_json(raw)
    if parsed is None:
        logger.warning("Could not parse LLM output as JSON. Falling back to mock.")
        return generate_mock_explanation(transaction, reasons)

    return _build_response_from_parsed(parsed, provider, transaction, reasons)


# ---- Provider calls ----------------------------------------------------


def _call_openai(prompt: str) -> str:
    """Call OpenAI Chat Completions. Imported lazily so a missing SDK never
    breaks startup or the mock path."""
    from openai import OpenAI  # type: ignore

    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key, timeout=settings.llm_timeout_seconds)
    response = client.chat.completions.create(
        model=settings.openai_model,
        temperature=settings.llm_temperature,
        max_tokens=settings.llm_max_tokens,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are a professional accounting audit assistant. Reply with valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content or ""


def _call_gemini(prompt: str) -> str:
    """Call Google Gemini. Imported lazily for the same robustness reasons."""
    import google.generativeai as genai  # type: ignore

    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        generation_config={
            "temperature": settings.llm_temperature,
            "max_output_tokens": settings.llm_max_tokens,
            "response_mime_type": "application/json",
        },
    )
    result = model.generate_content(
        prompt,
        request_options={"timeout": settings.llm_timeout_seconds},
    )
    return getattr(result, "text", "") or ""


# ---- Output parsing ----------------------------------------------------


def _parse_llm_json(raw: str) -> dict | None:
    """Best-effort JSON extraction from an LLM response."""
    text = raw.strip()
    # Strip markdown code fences if the model added them despite instructions.
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE).strip()
    try:
        data = json.loads(text)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        pass
    # Fallback: grab the first {...} block.
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(0))
            return data if isinstance(data, dict) else None
        except json.JSONDecodeError:
            return None
    return None


def _build_response_from_parsed(
    parsed: dict,
    provider: str,
    transaction: Transaction,
    reasons: list[str],
) -> ExplainResponse:
    """Validate and normalise the LLM JSON, falling back per-field if needed."""
    risk = str(parsed.get("risk", "")).strip().lower()
    explanation = str(parsed.get("explanation", "")).strip()
    recommendation = str(parsed.get("recommendation", "")).strip()

    # If the model returned an invalid risk or empty explanation, repair using
    # the mock so the response is always complete and coherent.
    if risk not in _VALID_RISKS or not explanation:
        mock = generate_mock_explanation(transaction, reasons)
        if risk not in _VALID_RISKS:
            risk = mock.risk
        if not explanation:
            explanation = mock.explanation
        if not recommendation:
            recommendation = mock.recommendation

    if not recommendation:
        recommendation = "Verify the supporting documentation and confirm the entry is authorised."

    return ExplainResponse(
        risk=risk,
        explanation=explanation,
        recommendation=recommendation,
        source=provider,
    )
