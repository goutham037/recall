import logging
from fastapi import APIRouter
from pydantic import BaseModel

from ..brand_seed import BRAND as SEED_BRAND, SEED_HISTORY, DEMO_COMPETITORS
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
    row["pillars_json"] = json_loads(row.get("pillars_json"))
    return row


@router.get("")
def get_brand():
    row = _hydrate(_get_brand_row())
    return {"brand": row}


@router.put("")
def put_brand(body: BrandBody):
    fields = body.model_dump(exclude_none=True)
    if "pillars_json" in fields:
        fields["pillars_json"] = json_dumps(fields["pillars_json"])
    with conn() as c:
        row = c.execute("SELECT id FROM brand WHERE id = 1").fetchone()
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
    return {"brand": _hydrate(out)}


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
