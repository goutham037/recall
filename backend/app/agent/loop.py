"""Agentic loop: user turn -> LLM (may call tools) -> LLM final answer.

The loop:
  1. Load brand, render system prompt.
  2. Recall recent conversation from Hindsight (so agent remembers past turns).
  3. Call Groq with tools.
  4. If Groq returns tool_calls, execute them, append tool results, loop up to N.
  5. Persist the exchange (user + assistant) as both SQLite chat_turns and
     Hindsight memories tagged 'conversation'.
"""
from __future__ import annotations
import json
import logging
from datetime import date
from typing import Any

from ..db import conn, json_dumps
from ..groq_client import groq
from ..hindsight_client import hs, HindsightError
from ..db import json_loads
from .system_prompt import render as render_system
from .tools import TOOL_SCHEMAS, run_tool


log = logging.getLogger("recall.loop")

MAX_HOPS = 6


def _brand() -> dict:
    with conn() as c:
        row = c.execute("SELECT * FROM brand WHERE id = 1").fetchone()
    if not row:
        return {"name": "your brand"}
    row["pillars_json"] = json_loads(row.get("pillars_json"))
    return row


def _load_recent_turns(limit: int = 6) -> list[dict]:
    with conn() as c:
        rows = c.execute(
            "SELECT role, content, tool_calls FROM chat_turn ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    rows.reverse()
    out: list[dict] = []
    for r in rows:
        msg: dict[str, Any] = {"role": r["role"], "content": r["content"]}
        # Only user/assistant messages fed back to LLM as plain text
        out.append(msg)
    return out


def _persist_turn(role: str, content: str, tool_calls: Any = None) -> None:
    with conn() as c:
        c.execute(
            "INSERT INTO chat_turn (role, content, tool_calls) VALUES (?,?,?)",
            (role, content, json_dumps(tool_calls) if tool_calls else None),
        )


def _retain_turn(role: str, content: str) -> None:
    if not content:
        return
    try:
        hs().retain(
            f"[{role}] {content}",
            context="conversation",
            tags=["conversation", f"role:{role}"],
        )
    except HindsightError as e:
        log.warning("retain turn: %s", e)


def chat(user_text: str) -> dict:
    brand = _brand()
    system = render_system(brand, today=date.today().isoformat())
    history = _load_recent_turns(limit=8)
    messages: list[dict] = [{"role": "system", "content": system}] + history + [
        {"role": "user", "content": user_text}
    ]
    _persist_turn("user", user_text)
    _retain_turn("user", user_text)

    trace: list[dict] = []
    for hop in range(MAX_HOPS):
        resp = groq().chat(messages=messages, tools=TOOL_SCHEMAS, tool_choice="auto")
        msg = groq().extract_message(resp)
        tool_calls = msg.get("tool_calls") or []
        content = msg.get("content") or ""
        trace.append({"hop": hop, "content_preview": content[:120], "tool_calls": [tc.get("function", {}).get("name") for tc in tool_calls]})

        if tool_calls:
            # Groq's assistant message with tool_calls must be preserved verbatim
            messages.append({
                "role": "assistant",
                "content": content or None,
                "tool_calls": tool_calls,
            })
            for tc in tool_calls:
                fn = tc.get("function") or {}
                name = fn.get("name")
                try:
                    args = json.loads(fn.get("arguments") or "{}")
                except json.JSONDecodeError:
                    args = {}
                result = run_tool(name, args)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.get("id"),
                    "name": name,
                    "content": json.dumps(result, default=str)[:12000],
                })
            continue

        # No tool call -> assistant final answer
        _persist_turn("assistant", content)
        _retain_turn("assistant", content)
        return {"ok": True, "reply": content, "trace": trace}

    # Fallback if we hit MAX_HOPS
    _persist_turn("assistant", "(hit max tool hops)")
    return {"ok": False, "reply": "Hit max tool hops without a final answer.", "trace": trace}
