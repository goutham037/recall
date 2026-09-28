from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..agent.tools import research_competitor as tool_research, list_competitors as tool_list
from ..db import conn

router = APIRouter(prefix="/competitors", tags=["competitors"])


class ResearchBody(BaseModel):
    handle: str = Field(..., min_length=1)
    channel: str = Field("instagram", pattern="^(instagram|facebook)$")


@router.get("")
def list_all():
    return tool_list()


@router.post("/track")
def track(body: ResearchBody):
    r = tool_research(body.handle, body.channel)
    if not r.get("ok"):
        raise HTTPException(status_code=400, detail=r.get("error", "research failed"))
    return r


@router.get("/{handle}/posts")
def posts(handle: str, limit: int = 20):
    with conn() as c:
        row = c.execute("SELECT * FROM competitor WHERE handle = ?", (handle,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"competitor {handle} not tracked")
        rows = c.execute(
            "SELECT * FROM competitor_post WHERE competitor_id = ? ORDER BY posted_at DESC LIMIT ?",
            (row["id"], limit),
        ).fetchall()
    return {"competitor": row, "posts": rows}


@router.delete("/{handle}")
def untrack(handle: str):
    with conn() as c:
        row = c.execute("SELECT * FROM competitor WHERE handle = ?", (handle,)).fetchone()
        if not row:
            return {"ok": True}
        c.execute("DELETE FROM competitor_post WHERE competitor_id = ?", (row["id"],))
        c.execute("DELETE FROM competitor WHERE id = ?", (row["id"],))
    return {"ok": True}
