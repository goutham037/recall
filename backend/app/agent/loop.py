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
    history = _load_recent_turns(limit=4)
    messages: list[dict] = [{"role": "system", "content": system}] + history + [
        {"role": "user", "content": user_text}
    ]
    _persist_turn("user", user_text)
    _retain_turn("user", user_text)

    trace: list[dict] = []
    try:
        for hop in range(MAX_HOPS):
            # Provide tool schemas so consecutive tools (like remember + plan_calendar) can execute
            tool_choice = "none" if hop == MAX_HOPS - 1 else "auto"
            resp = groq().chat(messages=messages, tools=TOOL_SCHEMAS, tool_choice=tool_choice, max_tokens=2500)
            msg = groq().extract_message(resp)
            tool_calls = msg.get("tool_calls") or []
            content = msg.get("content") or ""
            called_names = [tc.get("function", {}).get("name") for tc in tool_calls]
            trace.append({
                "hop": hop,
                "content_preview": content[:120],
                "tool_calls": called_names,
            })

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
                    raw_args = fn.get("arguments") or "{}"
                    try:
                        args = json.loads(raw_args)
                    except json.JSONDecodeError:
                        args = {}
                    result = run_tool(name, args)
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.get("id"),
                        "name": name,
                        "content": json.dumps(result, default=str)[:2000],
                    })
                continue

            # No tool call -> assistant final answer
            reply_text = content.strip() if content else ""
            if not reply_text:
                # If content was empty after tool calls, generate a helpful summary
                tools_used = [tc for h in trace for tc in h.get("tool_calls", [])]
                if "plan_calendar" in tools_used:
                    reply_text = "I've drafted your content schedule and added it to the **Editorial Calendar**! You can view and schedule the drafts on the **Calendar** tab."
                elif "remember" in tools_used:
                    reply_text = "I've retained that brand information in your Hindsight memory bank. It will be referenced in all future plans and copy generation."
                else:
                    reply_text = "Understood. The desk has processed your request."

            _persist_turn("assistant", reply_text)
            _retain_turn("assistant", reply_text)
            return {"ok": True, "reply": reply_text, "trace": trace}

        # Fallback if we hit MAX_HOPS
        tools_used = [tc for h in trace for tc in h.get("tool_calls", [])]
        if "plan_calendar" in tools_used:
            fallback = "Your editorial calendar drafts have been created and saved to the **Calendar** page! Check the Calendar tab to review them."
        else:
            fallback = "I've processed your instructions and filed the key details into brand memory."
        _persist_turn("assistant", fallback)
        return {"ok": True, "reply": fallback, "trace": trace}
    except Exception as e:
        log.exception("Chat agent error: %s", e)
        error_msg = str(e)
        if "429" in error_msg or "rate limit" in error_msg.lower():
            friendly_reply = "The CMO desk experienced a temporary rate limit with the AI engine. Please give it a few seconds and send your request again."
        else:
            friendly_reply = f"The desk encountered an issue: {error_msg[:150]}"
        return {"ok": False, "reply": friendly_reply, "error": error_msg, "trace": trace}
