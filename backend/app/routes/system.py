from fastapi import APIRouter

from ..config import get_settings
from ..hindsight_client import hs, HindsightError
from ..groq_client import groq, GroqError
from ..meta_client import meta, MetaError

router = APIRouter(tags=["system"])


@router.get("/health")
def health():
    return {"ok": True, "service": "recall"}


@router.get("/status")
def status():
    """Report which integrations are wired. Used by the frontend Setup page."""
    s = get_settings()
    checks: dict = {
        "hindsight": {"configured": bool(s.hindsight_api_key), "base_url": s.hindsight_base_url, "bank_id": s.hindsight_bank_id},
        "groq": {"configured": bool(s.groq_api_key), "model": s.groq_model},
        "meta": {
            "configured": bool(s.meta_access_token),
            "graph_version": s.meta_graph_version,
            "fb_page_id_set": bool(s.fb_page_id),
            "ig_user_set": bool(s.ig_business_account_id),
        },
    }

    if checks["hindsight"]["configured"]:
        try:
            checks["hindsight"]["stats"] = hs().stats()
            checks["hindsight"]["reachable"] = True
        except HindsightError as e:
            checks["hindsight"]["reachable"] = False
            checks["hindsight"]["error"] = str(e)

    from ..groq_client import get_groq_limits
    if checks["groq"]["configured"]:
        checks["groq"]["reachable"] = True
        checks["groq"]["limits"] = get_groq_limits()

    if checks["meta"]["configured"] and checks["meta"]["ig_user_set"]:
        try:
            media = meta().ig_recent_media(limit=1)
            checks["meta"]["reachable"] = True
            checks["meta"]["ig_media_sample"] = len(media)
        except MetaError as e:
            checks["meta"]["reachable"] = False
            checks["meta"]["error"] = str(e)

    return checks

