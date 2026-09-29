"""Studio — the workroom.

Four surfaces the frontend Studio page consumes:
  1. POST /studio/generate       — brief → 3 memory-grounded post variants
  2. GET  /studio/analytics      — posted-content aggregates + reflect narrative
  3. GET  /studio/recommendations — 5-item punch list, LLM'd over memory
  4. GET  /studio/trending       — top competitor posts + hashtag/theme leaderboard
"""
from __future__ import annotations
import json
import logging
import re
from collections import Counter
from datetime import date, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..db import conn, json_dumps, json_loads
from ..groq_client import groq, GroqError
from ..hindsight_client import hs, HindsightError


log = logging.getLogger("recall.studio")
router = APIRouter(prefix="/studio", tags=["studio"])


# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────

STOP = set(
    "the a an and or but of for to with in on at from by is are was were be been being "
    "we our your you they it this that these those i my me as if not so up out do does did "
    "have has had can will would should could may might over into more most just also new".split()
)


def _brand() -> dict:
    with conn() as c:
        row = c.execute("SELECT * FROM brand WHERE id = 1").fetchone()
    if not row:
        return {"name": "your brand"}
    row["pillars_json"] = json_loads(row.get("pillars_json"))
    return row


def _recall_grounding(query: str, tags: list[str]) -> list[dict]:
    try:
        r = hs().recall(query, tags=tags, tags_match="any")
        return (r.get("results") or [])[:12]
    except HindsightError as e:
        log.warning("studio recall: %s", e)
        return []


def _memory_block(mems: list[dict]) -> str:
    return "\n".join(f"- ({m.get('type','?')}) {m.get('text','')}" for m in mems) or "(no memories yet)"


def _extract_hashtags(text: str) -> list[str]:
    return [w.lower() for w in re.findall(r"#\w+", text or "")]


def _keywords(text: str) -> list[str]:
    words = re.findall(r"[A-Za-z][A-Za-z\-']{2,}", text or "")
    return [w.lower() for w in words if w.lower() not in STOP]


# ─────────────────────────────────────────────────────────────────────
# 1. GENERATE — brief → variants
# ─────────────────────────────────────────────────────────────────────

_GEN_SYSTEM = """You are the copy desk for a memory-first CMO. Given brand DNA,
retrieved memories, and a brief, produce exactly 3 distinct post variants.

Rules:
- Every variant is grounded in a specific memory. Cite it in `memory_ref` (short quote).
- Variant A leans into what memory shows performed BEST. Variant B tests a new angle. Variant C is short-form / punchy.
- Caption is 1–3 short sentences in the brand voice. First line MUST be a scroll-stopping hook.
- Hashtags: 5–10 relevant, brand-appropriate, no generic filler.
- image_prompt: one shot / one scene, verbs, gear, time-of-day. Never a static flatlay unless requested.
- cta_link uses the user-provided link if given, otherwise the brand default.

Return JSON only, matching:
{"variants":[{"hook":"","caption":"","hashtags":"","image_prompt":"","cta_link":"","rationale":"","memory_ref":""}, ...]}
"""


class GenBody(BaseModel):
    topic: str = Field(..., min_length=2, description="What the post is about")
    channels: list[str] = Field(default_factory=lambda: ["instagram", "facebook"])
    tone: str | None = None
    cta_link: str | None = None
    save_as_draft: bool = False
    save_as_drafts: bool = False


@router.post("/generate")
def generate(body: GenBody):
    brand = _brand()
    mems = _recall_grounding(
        query=f"post about {body.topic} for {brand.get('name','our brand')}",
        tags=["past-post", "high-performer", "brand-voice", "brand-audience", "learning", "brand-pillar"],
    )
    default_link = body.cta_link or (brand.get("website") or "")

    user_payload = json.dumps(
        {
            "brand": {
                "name": brand.get("name"),
                "voice": brand.get("voice"),
                "audience": brand.get("audience"),
                "pillars": brand.get("pillars_json") or [],
                "default_cta": default_link,
            },
            "brief": {
                "topic": body.topic,
                "tone": body.tone or "on-brand",
                "channels": body.channels,
                "cta_link": body.cta_link,
            },
            "retrieved_memories": _memory_block(mems),
            "today": date.today().isoformat(),
        },
        ensure_ascii=False,
    )

    try:
        resp = groq().chat(
            messages=[
                {"role": "system", "content": _GEN_SYSTEM},
                {"role": "user", "content": user_payload},
            ],
            temperature=0.7,
            max_tokens=3500,
            response_format={"type": "json_object"},
        )
    except GroqError as e:
        raise HTTPException(status_code=502, detail=f"Groq error: {e}")

    try:
        out = groq().extract_json(resp)
    except Exception as e:
        txt = groq().extract_text(resp)
        raise HTTPException(status_code=502, detail=f"generator returned non-JSON ({e}): {txt[:200]}")

    variants = out.get("variants") or []
    import random
    from ..agent.tools import DEMO_IMAGES

    for v in variants:
        if not v.get("image_url"):
            v["image_url"] = random.choice(DEMO_IMAGES)

    drafted: list[dict] = []
    should_save = body.save_as_draft or body.save_as_drafts
    if should_save and variants:
        today = date.today().isoformat()
        with conn() as c:
            for v in variants:
                cur = c.execute(
                    """INSERT INTO calendar_item
                    (scheduled_for, channels, pillar, hook, caption, hashtags, image_prompt, cta_link, status, rationale, image_url)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        today,
                        ",".join(body.channels),
                        None,
                        v.get("hook"),
                        v.get("caption"),
                        v.get("hashtags"),
                        v.get("image_prompt"),
                        v.get("cta_link") or default_link,
                        "draft",
                        v.get("rationale"),
                        v.get("image_url"),
                    ),
                )
                drafted.append(
                    c.execute("SELECT * FROM calendar_item WHERE id = ?", (cur.lastrowid,)).fetchone()
                )

    # Retain the generation event so the desk remembers you asked
    try:
        hs().retain(
            f"Generated {len(variants)} variants on topic: {body.topic}. Tone: {body.tone or 'on-brand'}.",
            context="generation",
            tags=["generation"],
        )
    except HindsightError:
        pass

    saved_ids = [d["id"] for d in drafted if d and "id" in d]
    return {
        "ok": True,
        "topic": body.topic,
        "grounded_on_memories": len(mems),
        "variants": variants,
        "drafted": drafted,
        "saved_ids": saved_ids,
    }


# ─────────────────────────────────────────────────────────────────────
# 2. ANALYTICS
# ─────────────────────────────────────────────────────────────────────


def _aggregate_metrics(posts: list[dict]) -> dict:
    total = 0
    reach = 0
    likes = 0
    comments = 0
    saved = 0
    engagement = 0
    top: dict | None = None
    top_score = -1.0
    for p in posts:
        m = json_loads(p.get("metrics_json"))
        if not isinstance(m, dict):
            continue
        total += 1
        this_reach = m.get("reach") or 0
        this_likes = m.get("likes") or m.get("like_count") or 0
        this_comments = m.get("comments") or m.get("comments_count") or 0
        this_saved = m.get("saved") or 0
        this_eng = m.get("engagement") or 0
        reach += int(this_reach or 0)
        likes += int(this_likes or 0)
        comments += int(this_comments or 0)
        saved += int(this_saved or 0)
        engagement += int(this_eng or 0)
        score = int(this_likes or 0) + int(this_comments or 0) * 3 + int(this_saved or 0) * 5
        if score > top_score:
            top_score = score
            top = {**p, "metrics": m, "score": score}
    return {
        "posts_with_metrics": total,
        "reach": reach,
        "likes": likes,
        "comments": comments,
        "saved": saved,
        "engagement": engagement,
        "top": top,
    }


@router.get("/analytics")
def analytics():
    with conn() as c:
        posts = c.execute("SELECT * FROM post ORDER BY posted_at DESC").fetchall()
        items = c.execute("SELECT * FROM calendar_item").fetchall()
        comp_posts = c.execute(
            "SELECT * FROM competitor_post ORDER BY (COALESCE(likes,0) + COALESCE(comments,0)*3) DESC LIMIT 8"
        ).fetchall()

    per_pillar = Counter(i.get("pillar") or "unassigned" for i in items)
    per_channel = Counter()
    for p in posts:
        per_channel[p.get("channel") or "unknown"] += 1

    metrics = _aggregate_metrics(posts)

    narrative = None
    try:
        r = hs().reflect(
            "What content patterns are working best for our brand right now, "
            "across pillars and formats? Any underperformers we should retire?"
        )
        narrative = {"text": r.get("text", ""), "based_on": (r.get("based_on") or {}).get("memories", [])[:6]}
    except HindsightError as e:
        narrative = {"text": None, "error": str(e)}

    return {
        "ok": True,
        "counts": {
            "calendar_items": len(items),
            "published_items": sum(1 for i in items if i.get("status") == "published"),
            "posts": len(posts),
        },
        "per_pillar": per_pillar,
        "per_channel": per_channel,
        "metrics": metrics,
        "top_competitor_posts": comp_posts,
        "narrative": narrative,
    }


# ─────────────────────────────────────────────────────────────────────
# 3. RECOMMENDATIONS
# ─────────────────────────────────────────────────────────────────────

_REC_SYSTEM = """You are the strategy chief for a memory-first CMO. Read the brand
DNA and retrieved memories, then output a ranked punch list of EXACTLY 5 concrete
next actions the brand should take this week.

Each item should:
- Be specific and actionable (name the pillar, format, channel, or timing).
- Be grounded in a memory. Cite it via `memory_ref` (short quote from retrieved).
- Ordered highest-leverage first.

Return JSON: {"actions":[{"title":"","why":"","urgency":"now|this-week|next-week","memory_ref":""}, ...]}
"""


@router.get("/recommendations")
def recommendations():
    brand = _brand()
    mems = _recall_grounding(
        query=f"What should {brand.get('name','our brand')} do next to grow its Instagram engagement and community?",
        tags=["past-post", "high-performer", "underperformer", "learning", "brand-pillar", "brand-audience"],
    )

    payload = json.dumps(
        {
            "brand": {
                "name": brand.get("name"),
                "voice": brand.get("voice"),
                "audience": brand.get("audience"),
                "pillars": brand.get("pillars_json") or [],
            },
            "retrieved_memories": _memory_block(mems),
            "today": date.today().isoformat(),
        },
        ensure_ascii=False,
    )
    try:
        resp = groq().chat(
            messages=[
                {"role": "system", "content": _REC_SYSTEM},
                {"role": "user", "content": payload},
            ],
            temperature=0.4,
            max_tokens=2500,
            response_format={"type": "json_object"},
        )
    except GroqError as e:
        raise HTTPException(status_code=502, detail=f"Groq error: {e}")
    try:
        out = groq().extract_json(resp)
    except Exception as e:
        txt = groq().extract_text(resp)
        raise HTTPException(status_code=502, detail=f"recommender returned non-JSON ({e}): {txt[:200]}")

    return {
        "ok": True,
        "grounded_on_memories": len(mems),
        "actions": out.get("actions") or [],
    }


# ─────────────────────────────────────────────────────────────────────
# 4. TRENDING
# ─────────────────────────────────────────────────────────────────────


@router.get("/trending")
def trending():
    with conn() as c:
        rows = c.execute(
            "SELECT cp.*, c.handle, c.display_name FROM competitor_post cp "
            "JOIN competitor c ON c.id = cp.competitor_id "
            "ORDER BY (COALESCE(cp.likes,0) + COALESCE(cp.comments,0)*3) DESC LIMIT 30"
        ).fetchall()

    hashtag_counts: Counter = Counter()
    word_counts: Counter = Counter()
    for r in rows:
        for h in _extract_hashtags(r.get("caption") or ""):
            hashtag_counts[h] += 1
        for w in _keywords(r.get("caption") or ""):
            word_counts[w] += 1

    per_handle: dict[str, dict] = {}
    for r in rows:
        h = r.get("handle") or "?"
        d = per_handle.setdefault(h, {"handle": h, "display_name": r.get("display_name"), "posts": 0, "engagement": 0})
        d["posts"] += 1
        d["engagement"] += int(r.get("likes") or 0) + int(r.get("comments") or 0) * 3
    leaderboard = sorted(per_handle.values(), key=lambda x: -x["engagement"])[:8]

    return {
        "ok": True,
        "top_posts": rows[:10],
        "top_hashtags": [{"tag": t, "count": n} for t, n in hashtag_counts.most_common(15)],
        "top_themes": [{"word": w, "count": n} for w, n in word_counts.most_common(15)],
        "leaderboard": leaderboard,
    }
