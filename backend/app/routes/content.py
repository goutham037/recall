from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..agent.tools import (
    plan_calendar as tool_plan,
    publish_post as tool_publish,
    list_calendar as tool_list_cal,
    list_recent_posts as tool_list_posts,
    fetch_performance as tool_perf,
)
from ..db import conn

router = APIRouter(prefix="/content", tags=["content"])


class PlanBody(BaseModel):
    days: int = Field(7, ge=1, le=30)
    channels: list[str] = Field(default_factory=lambda: ["instagram", "facebook"])
    focus: str | None = None
    cta_link: str | None = None
    start_date: str | None = None


class UpdateItemBody(BaseModel):
    caption: str | None = None
    hashtags: str | None = None
    image_url: str | None = None
    cta_link: str | None = None
    scheduled_for: str | None = None
    status: str | None = None


@router.post("/plan")
def plan(body: PlanBody):
    try:
        r = tool_plan(
            days=body.days,
            channels=body.channels,
            focus=body.focus,
            cta_link=body.cta_link,
            start_date=body.start_date,
        )
        if not r.get("ok"):
            raise HTTPException(status_code=400, detail=r.get("error", "plan failed"))
        return r
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"plan generation error: {e}")


class CreateItemBody(BaseModel):
    scheduled_for: str | None = None
    channels: list[str] = Field(default_factory=lambda: ["instagram", "facebook"])
    pillar: str | None = None
    hook: str | None = None
    caption: str
    hashtags: str | None = None
    image_url: str | None = None
    image_prompt: str | None = None
    cta_link: str | None = None
    rationale: str | None = None
    status: str = "draft"


@router.post("/calendar")
def create_calendar_item(body: CreateItemBody):
    from datetime import date
    import random
    from ..agent.tools import DEMO_IMAGES

    sched = body.scheduled_for or date.today().isoformat()
    chans = ",".join(body.channels) if isinstance(body.channels, list) else str(body.channels)
    img = body.image_url or random.choice(DEMO_IMAGES)
    with conn() as c:
        cur = c.execute(
            """INSERT INTO calendar_item
            (scheduled_for, channels, pillar, hook, caption, hashtags, image_prompt, cta_link, status, rationale, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                sched,
                chans,
                body.pillar,
                body.hook,
                body.caption,
                body.hashtags,
                body.image_prompt,
                body.cta_link,
                body.status,
                body.rationale,
                img,
            ),
        )
        row = c.execute("SELECT * FROM calendar_item WHERE id = ?", (cur.lastrowid,)).fetchone()
    return {"ok": True, "item": row}


@router.get("/calendar")
def calendar(status: str | None = None):
    return tool_list_cal(status=status)


@router.delete("/calendar")
def clear_calendar(status: str | None = None):
    with conn() as c:
        if status:
            c.execute(
                "DELETE FROM post WHERE calendar_item_id IN (SELECT id FROM calendar_item WHERE status = ?)",
                (status,),
            )
            c.execute("DELETE FROM calendar_item WHERE status = ?", (status,))
        else:
            c.execute("DELETE FROM post WHERE calendar_item_id IS NOT NULL")
            c.execute("DELETE FROM calendar_item")
    return {"ok": True}


@router.patch("/calendar/{item_id}")
def update_calendar(item_id: int, body: UpdateItemBody):
    fields = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not fields:
        return {"ok": True, "updated": 0}
    sets = ", ".join(f"{k} = ?" for k in fields.keys())
    values = list(fields.values()) + [item_id]
    with conn() as c:
        c.execute(f"UPDATE calendar_item SET {sets} WHERE id = ?", values)
        row = c.execute("SELECT * FROM calendar_item WHERE id = ?", (item_id,)).fetchone()
    return {"ok": True, "item": row}


@router.delete("/calendar/{item_id}")
def delete_calendar(item_id: int):
    with conn() as c:
        c.execute("DELETE FROM post WHERE calendar_item_id = ?", (item_id,))
        c.execute("DELETE FROM calendar_item WHERE id = ?", (item_id,))
    return {"ok": True}


@router.post("/calendar/{item_id}/publish")
def publish(item_id: int):
    r = tool_publish(item_id=item_id)
    if not r.get("ok") and not r.get("published"):
        raise HTTPException(status_code=400, detail=r.get("errors") or r.get("error", "publish failed"))
    return r


@router.get("/posts")
def posts(limit: int = 20):
    return tool_list_posts(limit=limit)


@router.delete("/posts")
def clear_posts():
    with conn() as c:
        c.execute("DELETE FROM post")
    return {"ok": True}


@router.delete("/posts/{post_id}")
def delete_post(post_id: int):
    with conn() as c:
        c.execute("DELETE FROM post WHERE id = ? OR calendar_item_id = ?", (post_id, post_id))
    return {"ok": True}


@router.post("/posts/refresh-performance")
def refresh_perf():
    return tool_perf()
