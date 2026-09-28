from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..agent.loop import chat as run_chat
from ..db import conn

router = APIRouter(prefix="/agent", tags=["agent"])


class ChatBody(BaseModel):
    message: str = Field(..., min_length=1)


@router.post("/chat")
def chat(body: ChatBody):
    try:
        return run_chat(body.message)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def history(limit: int = 50):
    with conn() as c:
        rows = c.execute(
            "SELECT id, role, content, created_at FROM chat_turn ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    rows.reverse()
    return {"turns": rows}


@router.delete("/history")
def wipe_history():
    with conn() as c:
        c.execute("DELETE FROM chat_turn")
    return {"ok": True}
