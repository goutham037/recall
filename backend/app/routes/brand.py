import logging
from fastapi import APIRouter
from pydantic import BaseModel

from ..brand_seed import (
    BRAND as SEED_BRAND,
    SEED_HISTORY,
    DEMO_COMPETITORS,
    generate_domain_seed_history,
    generate_domain_calendar_drafts,
)
from ..config import get_settings
from ..db import conn, json_dumps, json_loads
from ..hindsight_client import hs, HindsightError

log = logging.getLogger("recall.brand")
router = APIRouter(prefix="/brand", tags=["brand"])


class BrandBody(BaseModel):
    name: str | None = None
    tagline: str | None = None
    voice: str | None = None
    audience: str | None = None
    pillars_json: list[dict] | None = None
    website: str | None = None
    ig_username: str | None = None
    fb_page_id: str | None = None
    ig_business_account_id: str | None = None


def _get_brand_row() -> dict | None:
    with conn() as c:
        return c.execute("SELECT * FROM brand WHERE id = 1").fetchone()


def _hydrate(row: dict | None) -> dict | None:
    if not row:
        return None
    r = dict(row)
    r["pillars_json"] = json_loads(r.get("pillars_json"))
    return r


def ensure_brand_memories(brand_row: dict, force: bool = False):
    name = (brand_row.get("name") or "Our Brand").strip()
    tagline = brand_row.get("tagline") or ""
    voice = brand_row.get("voice") or ""
    audience = brand_row.get("audience") or ""
    pillars = brand_row.get("pillars_json")
    if isinstance(pillars, str):
        pillars = json_loads(pillars)
    if not isinstance(pillars, list):
        pillars = []

    try:
        hs().ensure_bank(
            mission=f"Answer as {name}'s memory-augmented CMO: cite past posts, learnings, and community metrics."
        )
        stats = hs().stats()
        nodes = stats.get("total_nodes", 0)
        if nodes > 2 and not force:
            return
    except Exception as e:
        log.warning("ensure_bank/stats: %s", e)

    try:
        # Retain core brand DNA
        hs().retain(
            f"Brand name: {name}. Tagline: {tagline}. Website: {brand_row.get('website','')}.",
            context="brand-voice",
            tags=["brand-voice"],
        )
        if voice:
            hs().retain(f"Voice guide: {voice}", context="brand-voice", tags=["brand-voice"])
        if audience:
            hs().retain(f"Target audience: {audience}", context="brand-audience", tags=["brand-audience"])
        for p in pillars:
            p_name = p.get("name") if isinstance(p, dict) else str(p)
            p_detail = p.get("detail", "") if isinstance(p, dict) else ""
            hs().retain(
                f"Pillar '{p_name}': {p_detail}",
                context="brand-pillar",
                tags=["brand-pillar", f"pillar:{p_name.lower().replace(' ', '-').replace('_', '-')}"],
            )

        # Retain domain past-post history
        history = generate_domain_seed_history(brand_row)
        for h in history:
            hs().retain(h["content"], context=h["context"], tags=h["tags"])
    except Exception as e:
        log.warning("ensure_brand_memories error: %s", e)


@router.get("")
def get_brand():
    row = _hydrate(_get_brand_row())
    if row:
        try:
            stats = hs().stats()
            if stats.get("total_nodes", 0) == 0:
                ensure_brand_memories(row)
        except Exception as e:
            log.warning("auto-ensure memories in get_brand: %s", e)
    return {"brand": row}


@router.put("")
def put_brand(body: BrandBody):
    fields = body.model_dump(exclude_none=True)
    if "pillars_json" in fields:
        fields["pillars_json"] = json_dumps(fields["pillars_json"])

    with conn() as c:
        row = c.execute("SELECT * FROM brand WHERE id = 1").fetchone()
        prev_name = row["name"] if row else None
        brand_changed = bool(body.name and prev_name and body.name.strip().lower() != prev_name.strip().lower())

        if row:
            sets = ", ".join(f"{k}=?" for k in fields.keys())
            values = list(fields.values())
            c.execute(f"UPDATE brand SET {sets}, updated_at = datetime('now') WHERE id = 1", values)
        else:
            keys = ["id"] + list(fields.keys())
            marks = ", ".join(["?"] * len(keys))
            c.execute(
                f"INSERT INTO brand ({', '.join(keys)}) VALUES ({marks})",
                [1] + list(fields.values()),
            )
        out = c.execute("SELECT * FROM brand WHERE id = 1").fetchone()
        hydrated = _hydrate(dict(out))

        if brand_changed:
            # Clear old conversation & old calendar items so they don't cross-contaminate
            c.execute("DELETE FROM chat_turn")
            c.execute("DELETE FROM calendar_item")
            # Populate brand new domain calendar drafts
            drafts = generate_domain_calendar_drafts(hydrated)
            for d in drafts:
                c.execute(
                    """INSERT INTO calendar_item
                    (scheduled_for, channels, pillar, hook, caption, hashtags, image_prompt, cta_link, status, rationale, image_url)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        d["scheduled_for"],
                        d["channels"],
                        d.get("pillar"),
                        d.get("hook"),
                        d.get("caption"),
                        d.get("hashtags"),
                        d.get("image_prompt"),
                        d.get("cta_link"),
                        d.get("status", "draft"),
                        d.get("rationale"),
                        d.get("image_url"),
                    ),
                )

    # Retain brand memories to the new/current bank
    ensure_brand_memories(hydrated, force=brand_changed)

    return {"brand": hydrated}


@router.post("/seed")
def seed():
    """Seed NorthPulse brand + history into SQLite AND Hindsight."""
    s = get_settings()
    # 1) SQLite brand row
    seed_row = dict(SEED_BRAND)
    seed_row["pillars_json"] = json_dumps(seed_row["pillars_json"])
    seed_row["fb_page_id"] = s.fb_page_id or None
    seed_row["ig_business_account_id"] = s.ig_business_account_id or None
    with conn() as c:
        c.execute("DELETE FROM brand")
        c.execute("DELETE FROM chat_turn")
        c.execute("DELETE FROM calendar_item")
        c.execute(
            """INSERT INTO brand (id, name, tagline, voice, audience, pillars_json, website, ig_username, fb_page_id, ig_business_account_id)
               VALUES (1,?,?,?,?,?,?,?,?,?)""",
            (
                seed_row["name"], seed_row["tagline"], seed_row["voice"], seed_row["audience"],
                seed_row["pillars_json"], seed_row["website"], seed_row["ig_username"],
                seed_row.get("fb_page_id"), seed_row.get("ig_business_account_id"),
            ),
        )
        # Seed demo competitors
        for comp in DEMO_COMPETITORS:
            c.execute(
                "INSERT OR IGNORE INTO competitor (handle, channel, display_name) VALUES (?,?,?)",
                (comp["handle"], comp["channel"], comp["display_name"]),
            )

    # 2) Hindsight bank + seed memories
    stored = 0
    ensured = None
    try:
        ensured = hs().ensure_bank(
            mission=f"Answer as {SEED_BRAND['name']}'s memory-augmented CMO: cite past posts, learnings, and competitor moves."
        )
        # Brand DNA as durable world facts
        hs().retain(f"Brand name: {SEED_BRAND['name']}. Tagline: {SEED_BRAND['tagline']}.", context="brand-voice", tags=["brand-voice"])
        hs().retain(f"Voice guide: {SEED_BRAND['voice']}", context="brand-voice", tags=["brand-voice"])
        hs().retain(f"Target audience: {SEED_BRAND['audience']}", context="brand-audience", tags=["brand-audience"])
        for p in SEED_BRAND["pillars_json"]:
            hs().retain(f"Pillar '{p['name']}': {p['detail']}", context="brand-pillar", tags=["brand-pillar", f"pillar:{p['name'].lower().replace(' ', '-')}"])
            stored += 1
        for h in SEED_HISTORY:
            hs().retain(h["content"], context=h["context"], tags=h["tags"])
            stored += 1
    except HindsightError as e:
        log.warning("seed retain failed: %s", e)
        return {"ok": False, "error": str(e), "sqlite_seeded": True}

    return {"ok": True, "brand": SEED_BRAND["name"], "hindsight_bank": ensured, "seeded_memories": stored + 3}

