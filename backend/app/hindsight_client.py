"""Hindsight (Vectorize) memory client.

Hindsight terminology:
  - **bank_id**: the memory store for one brand. We use one bank per workspace.
  - **items**: what we `retain()`. Free-form text; Hindsight extracts facts.
  - **tags**: scoping labels. We use them to segment memories:
        brand-voice, brand-audience, brand-pillar,
        content-plan, past-post, performance, learning,
        competitor:<handle>
  - **fact_type**: world (durable facts), experience (events),
                   observation (synthesized reflections).
  - **recall()**: semantic search, returns raw memories.
  - **reflect()**: LLM-synthesized answer *grounded in* memories (the killer).

Docs: https://hindsight.vectorize.io  |  API base: https://hindsight.vectorize.io
"""
from __future__ import annotations
import logging
from typing import Any, Iterable

import httpx

from .config import get_settings


log = logging.getLogger("recall.hindsight")


class HindsightError(RuntimeError):
    pass


class HindsightClient:
    def __init__(self, base_url: str | None = None, api_key: str | None = None, bank_id: str | None = None):
        s = get_settings()
        self.base_url = (base_url or s.hindsight_base_url).rstrip("/")
        self.api_key = api_key or s.hindsight_api_key
        self.bank_id = bank_id or s.hindsight_bank_id
        self._client = httpx.Client(timeout=60.0)

    # ---- low-level ----
    def _headers(self) -> dict[str, str]:
        h = {"Content-Type": "application/json"}
        if self.api_key:
            # Hindsight accepts `Authorization: Bearer <key>` on cloud; keep both to be safe.
            h["Authorization"] = f"Bearer {self.api_key}"
            h["authorization"] = f"Bearer {self.api_key}"
        return h

    def _url(self, path: str) -> str:
        if not path.startswith("/"):
            path = "/" + path
        return f"{self.base_url}{path}"

    def _request(self, method: str, path: str, json: Any = None, params: dict | None = None) -> Any:
        try:
            r = self._client.request(method, self._url(path), json=json, params=params, headers=self._headers())
        except httpx.HTTPError as e:
            raise HindsightError(f"Hindsight transport error: {e}") from e
        if r.status_code >= 400:
            raise HindsightError(f"Hindsight {r.status_code} on {method} {path}: {r.text[:400]}")
        if not r.content:
            return {}
        try:
            return r.json()
        except ValueError:
            return {"raw": r.text}

    # ---- bank setup ----
    def ensure_bank(self, mission: str | None = None) -> dict:
        """Create/update the bank so retain() has somewhere to go."""
        body = {
            "reflect_mission": mission
            or "Answer as NorthPulse's memory-augmented CMO: cite past posts, learnings, and competitor moves.",
            "retain_mission": "Retain durable brand DNA, per-post experiences, performance observations, and competitor moves.",
            "retain_extraction_mode": "concise",
            "enable_observations": True,
            "enable_text_search": True,
            "enable_temporal_retrieval": True,
            "enable_graph_retrieval": True,
        }
        return self._request("PUT", f"/v1/default/banks/{self.bank_id}", json=body)

    def stats(self) -> dict:
        return self._request("GET", f"/v1/default/banks/{self.bank_id}/stats")

    def graph(self) -> dict:
        return self._request("GET", f"/v1/default/banks/{self.bank_id}/graph")

    # ---- write ----
    def retain(
        self,
        content: str,
        *,
        context: str | None = None,
        document_id: str | None = None,
        tags: Iterable[str] | None = None,
    ) -> dict:
        item: dict[str, Any] = {"content": content}
        if context:
            item["context"] = context
        if document_id:
            item["document_id"] = document_id
        if tags:
            item["tags"] = list(tags)
        body = {"items": [item], "async": False}
        return self._request("POST", f"/v1/default/banks/{self.bank_id}/memories", json=body)

    def retain_many(self, items: list[dict]) -> dict:
        return self._request(
            "POST",
            f"/v1/default/banks/{self.bank_id}/memories",
            json={"items": items, "async": False},
        )

    # ---- read ----
    def recall(
        self,
        query: str,
        *,
        tags: Iterable[str] | None = None,
        tags_match: str = "any",
        types: Iterable[str] | None = None,
        budget: str = "mid",
    ) -> dict:
        body: dict[str, Any] = {"query": query, "budget": budget}
        if tags:
            body["tags"] = list(tags)
            body["tags_match"] = tags_match
        if types:
            body["types"] = list(types)
        return self._request("POST", f"/v1/default/banks/{self.bank_id}/memories/recall", json=body)

    def reflect(self, query: str, *, budget: str = "mid", include_facts: bool = True) -> dict:
        body: dict[str, Any] = {"query": query, "budget": budget}
        if include_facts:
            body["include"] = {"facts": {}}
        return self._request("POST", f"/v1/default/banks/{self.bank_id}/reflect", json=body)

    def list_memories(self, limit: int = 50, offset: int = 0) -> dict:
        return self._request(
            "GET",
            f"/v1/default/banks/{self.bank_id}/memories/list",
            params={"limit": limit, "offset": offset},
        )

    def delete_memory(self, memory_id: str) -> dict:
        return self._request("DELETE", f"/v1/default/banks/{self.bank_id}/memories/{memory_id}")

    # ---- convenience ----
    def format_recall(self, recall_response: dict, cap: int = 8) -> str:
        rows = (recall_response or {}).get("results", [])[:cap]
        if not rows:
            return "(no relevant memories)"
        lines = []
        for r in rows:
            typ = r.get("type", "?")
            txt = (r.get("text") or "").strip().replace("\n", " ")
            score = r.get("score")
            score_s = f"  [score={score:.2f}]" if isinstance(score, (int, float)) else ""
            lines.append(f"- ({typ}) {txt}{score_s}")
        return "\n".join(lines)


_client: HindsightClient | None = None


def hs() -> HindsightClient:
    global _client
    if _client is None:
        _client = HindsightClient()
    return _client
