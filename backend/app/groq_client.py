"""Groq LLM client — OpenAI-compatible chat completions with function calling."""
from __future__ import annotations
import logging
from typing import Any

import httpx

from .config import get_settings


log = logging.getLogger("recall.groq")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqError(RuntimeError):
    pass


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
        max_tokens: int = 1200,
        response_format: dict | None = None,
    ) -> dict:
        if not self.api_key:
            raise GroqError("GROQ_API_KEY is not set")
        body: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if tools:
            body["tools"] = tools
            body["tool_choice"] = tool_choice
        if response_format:
            body["response_format"] = response_format
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        try:
            r = self._client.post(GROQ_URL, json=body, headers=headers)
        except httpx.HTTPError as e:
            raise GroqError(f"Groq transport error: {e}") from e
        if r.status_code >= 400:
            raise GroqError(f"Groq {r.status_code}: {r.text[:400]}")
        return r.json()

    @staticmethod
    def extract_message(resp: dict) -> dict:
        return resp["choices"][0]["message"]

    @staticmethod
    def extract_text(resp: dict) -> str:
        return resp["choices"][0]["message"].get("content") or ""


_client: GroqClient | None = None


def groq() -> GroqClient:
    global _client
    if _client is None:
        _client = GroqClient()
    return _client
