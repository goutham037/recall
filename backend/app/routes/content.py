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


class UpdateItemBody(BaseModel):
    caption: str | None = None
    hashtags: str | None = None
    image_url: str | None = None
    cta_link: str | None = None
    scheduled_for: str | None = None
    status: str | None = None


@router.post("/plan")
def plan(body: PlanBody):
    r = tool_plan(days=body.days, channels=body.channels, focus=body.focus, cta_link=body.cta_link)
    if not r.get("ok"):
        raise HTTPException(status_code=400, detail=r.get("error", "plan failed"))
    return r


@router.get("/calendar")
def calendar(status: str | None = None):
    return tool_list_cal(status=status)


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


@router.post("/posts/refresh-performance")
def refresh_perf():
    return tool_perf()
