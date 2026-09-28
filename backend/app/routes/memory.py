from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..hindsight_client import hs, HindsightError

router = APIRouter(prefix="/memory", tags=["memory"])


class RetainBody(BaseModel):
    content: str = Field(..., min_length=1)
    context: str | None = None
    tags: list[str] | None = None


class RecallBody(BaseModel):
    query: str = Field(..., min_length=1)
    tags: list[str] | None = None
    tags_match: str = "any"
    budget: str = "mid"


class ReflectBody(BaseModel):
    question: str = Field(..., min_length=1)
    budget: str = "mid"


@router.get("/stats")
def stats():
    try:
        return hs().stats()
    except HindsightError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/list")
def list_memories(limit: int = 50, offset: int = 0):
    try:
        return hs().list_memories(limit=limit, offset=offset)
    except HindsightError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/retain")
def retain(body: RetainBody):
    try:
        return hs().retain(body.content, context=body.context, tags=body.tags)
    except HindsightError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/recall")
def recall(body: RecallBody):
    try:
        return hs().recall(body.query, tags=body.tags, tags_match=body.tags_match, budget=body.budget)
    except HindsightError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/reflect")
def reflect(body: ReflectBody):
    try:
        return hs().reflect(body.question, budget=body.budget)
    except HindsightError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/graph")
def graph():
    try:
        return hs().graph()
    except HindsightError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.delete("/{memory_id}")
def delete_one(memory_id: str):
    try:
        return hs().delete_memory(memory_id)
    except HindsightError as e:
        raise HTTPException(status_code=502, detail=str(e))
