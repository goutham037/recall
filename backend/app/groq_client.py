"""Groq LLM client — OpenAI-compatible chat completions with function calling."""
from __future__ import annotations
import json
import logging
import re
from typing import Any

import httpx

from .config import get_settings


log = logging.getLogger("recall.groq")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqError(RuntimeError):
    pass


_latest_limits: dict[str, Any] = {
    "remaining_requests": 1000,
    "limit_requests": 1000,
    "remaining_tokens": 8000,
    "limit_tokens": 8000,
    "reset_tokens": "0s",
    "reset_requests": "0s",
    "model": "openai/gpt-oss-120b",
}


def get_groq_limits() -> dict[str, Any]:
    return dict(_latest_limits)


def safe_parse_json(text: str) -> Any:
    """Robust JSON parser that handles markdown code blocks, backticks, and extra wrapper text."""
    if not text:
        raise ValueError("Empty response text")
    clean = text.strip()
    # Strip markdown code fences if present
    if clean.startswith("```"):
        clean = re.sub(r"^```(?:json)?\s*", "", clean, flags=re.IGNORECASE)
        clean = re.sub(r"\s*```$", "", clean)
        clean = clean.strip()

    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        pass

    # Extract JSON object or array by finding outermost braces/brackets
    match = re.search(r"(\{.*\}|\[.*\])", clean, re.DOTALL)
    if match:
        snippet = match.group(1).strip()
        try:
            return json.loads(snippet)
        except json.JSONDecodeError:
            pass

    # Fallback: scan for first { or [ to last } or ]
    first_brace = clean.find("{")
    last_brace = clean.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(clean[first_brace : last_brace + 1])
        except json.JSONDecodeError:
            pass

    first_bracket = clean.find("[")
    last_bracket = clean.rfind("]")
    if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
        try:
            return json.loads(clean[first_bracket : last_bracket + 1])
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse valid JSON from text: {text[:200]}")


class GroqClient:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        s = get_settings()
        self.api_key = api_key or s.groq_api_key
        self.model = model or s.groq_model
        self._client = httpx.Client(timeout=120.0)

    def chat(
        self,
        messages: list[dict],
        *,
        tools: list[dict] | None = None,
        tool_choice: str = "auto",
        temperature: float = 0.4,
        max_tokens: int = 3000,
        response_format: dict | None = None,
    ) -> dict:
        if not self.api_key:
            raise GroqError("GROQ_API_KEY is not set")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # Try primary model first, fallback to alternate model on 413/429
        fallback_model = "openai/gpt-oss-20b" if "120b" in self.model else "openai/gpt-oss-120b"
        candidate_models = [self.model, fallback_model]

        last_error = None
        for cand_model in candidate_models:
            body: dict[str, Any] = {
                "model": cand_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if tools:
                body["tools"] = tools
                body["tool_choice"] = tool_choice
            if response_format:
                body["response_format"] = response_format

            for attempt in range(2):
                try:
                    r = self._client.post(GROQ_URL, json=body, headers=headers)
                except httpx.HTTPError as e:
                    last_error = GroqError(f"Groq transport error: {e}")
                    break

                # Update live rate limit tracker from response headers
                try:
                    _latest_limits["model"] = cand_model
                    if "x-ratelimit-remaining-requests" in r.headers:
                        _latest_limits["remaining_requests"] = int(r.headers.get("x-ratelimit-remaining-requests", 1000))
                        _latest_limits["limit_requests"] = int(r.headers.get("x-ratelimit-limit-requests", 1000))
                        _latest_limits["remaining_tokens"] = int(r.headers.get("x-ratelimit-remaining-tokens", 8000))
                        _latest_limits["limit_tokens"] = int(r.headers.get("x-ratelimit-limit-tokens", 8000))
                        _latest_limits["reset_tokens"] = r.headers.get("x-ratelimit-reset-tokens", "0s")
                        _latest_limits["reset_requests"] = r.headers.get("x-ratelimit-reset-requests", "0s")
                except Exception:
                    pass

                if r.status_code == 200:
                    return r.json()

                # If Groq returns 400 json_validate_failed because of strict JSON schema or token cutoff,
                # retry immediately without response_format and with higher token ceiling
                if r.status_code == 400 and "json_validate_failed" in r.text and "response_format" in body:
                    log.warning("Groq 400 json_validate_failed on %s; retrying without response_format constraint", cand_model)
                    body.pop("response_format", None)
                    body["max_tokens"] = max(body.get("max_tokens", 3000), 3500)
                    continue

                if r.status_code in (413, 429):
                    last_error = GroqError(f"Groq {r.status_code} on {cand_model}: {r.text[:300]}")
                    log.warning("Groq %s hit on %s, trying fallback or retrying...", r.status_code, cand_model)
                    import time
                    time.sleep(1.0)
                    continue

                # Any other 4xx/5xx error
                raise GroqError(f"Groq {r.status_code}: {r.text[:400]}")

        if last_error:
            raise last_error
        raise GroqError("Groq request failed")

    @staticmethod
    def extract_message(resp: dict) -> dict:
        return resp["choices"][0]["message"]

    @staticmethod
    def extract_text(resp: dict) -> str:
        return resp["choices"][0]["message"].get("content") or ""

    @staticmethod
    def extract_json(resp: dict) -> Any:
        txt = resp["choices"][0]["message"].get("content") or ""
        return safe_parse_json(txt)


_client: GroqClient | None = None


def groq() -> GroqClient:
    global _client
    if _client is None:
        _client = GroqClient()
    return _client

