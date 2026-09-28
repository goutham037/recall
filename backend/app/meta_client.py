"""Meta Graph API wrapper — Facebook Page + Instagram Business publishing.

Endpoints used:
  - FB text post:          POST /{page_id}/feed             {message, link?}
  - FB photo post:         POST /{page_id}/photos           {url, caption}
  - IG container:          POST /{ig_user}/media            {image_url, caption}
  - IG publish:            POST /{ig_user}/media_publish    {creation_id}
  - IG account media:      GET  /{ig_user}/media?fields=id,caption,timestamp,permalink,media_type,like_count,comments_count
  - IG media insights:     GET  /{media_id}/insights?metric=impressions,reach,saved,engagement
  - FB page posts:         GET  /{page_id}/posts?fields=id,message,created_time,permalink_url,reactions.summary(true),comments.summary(true)
  - IG business discovery: GET  /{our_ig_user}?fields=business_discovery.username({handle}){...}

All calls include access_token; graceful errors surface Meta's message so the
agent can explain to the user WHY something failed (permission gap, etc).
"""
from __future__ import annotations
import logging
from typing import Any

import httpx

from .config import get_settings


log = logging.getLogger("recall.meta")


class MetaError(RuntimeError):
    pass


class MetaClient:
    def __init__(self):
        s = get_settings()
        self.token = s.meta_access_token
        self.version = s.meta_graph_version or "v21.0"
        self.fb_page_id = s.fb_page_id
        self.ig_user = s.ig_business_account_id
        self.base = f"https://graph.facebook.com/{self.version}"
        self._client = httpx.Client(timeout=60.0)

    def _require_token(self) -> None:
        if not self.token:
            raise MetaError("META_ACCESS_TOKEN not configured")

    def _get(self, path: str, params: dict | None = None) -> dict:
        self._require_token()
        p = dict(params or {})
        p["access_token"] = self.token
        try:
            r = self._client.get(f"{self.base}{path}", params=p)
        except httpx.HTTPError as e:
            raise MetaError(f"Meta transport error: {e}") from e
        if r.status_code >= 400:
            raise MetaError(f"Meta GET {path} {r.status_code}: {r.text[:400]}")
        return r.json()

    def _post(self, path: str, data: dict) -> dict:
        self._require_token()
        d = dict(data)
        d["access_token"] = self.token
        try:
            r = self._client.post(f"{self.base}{path}", data=d)
        except httpx.HTTPError as e:
            raise MetaError(f"Meta transport error: {e}") from e
        if r.status_code >= 400:
            raise MetaError(f"Meta POST {path} {r.status_code}: {r.text[:400]}")
        return r.json()

    # ---- Facebook Page ----
    def fb_post_text(self, message: str, link: str | None = None) -> dict:
        if not self.fb_page_id:
            raise MetaError("FB_PAGE_ID not configured")
        body: dict[str, Any] = {"message": message}
        if link:
            body["link"] = link
        return self._post(f"/{self.fb_page_id}/feed", body)

    def fb_post_photo(self, image_url: str, caption: str | None = None) -> dict:
        if not self.fb_page_id:
            raise MetaError("FB_PAGE_ID not configured")
        body: dict[str, Any] = {"url": image_url}
        if caption:
            body["caption"] = caption
        return self._post(f"/{self.fb_page_id}/photos", body)

    def fb_page_posts(self, limit: int = 10) -> list[dict]:
        if not self.fb_page_id:
            raise MetaError("FB_PAGE_ID not configured")
        fields = "id,message,created_time,permalink_url,reactions.summary(true),comments.summary(true)"
        resp = self._get(f"/{self.fb_page_id}/posts", {"fields": fields, "limit": limit})
        return resp.get("data", [])

    # ---- Instagram Business ----
    def ig_create_container(self, image_url: str, caption: str) -> str:
        if not self.ig_user:
            raise MetaError("IG_BUSINESS_ACCOUNT_ID not configured")
        resp = self._post(f"/{self.ig_user}/media", {"image_url": image_url, "caption": caption})
        cid = resp.get("id")
        if not cid:
            raise MetaError(f"IG container missing id: {resp}")
        return cid

    def ig_publish(self, creation_id: str) -> dict:
        if not self.ig_user:
            raise MetaError("IG_BUSINESS_ACCOUNT_ID not configured")
        return self._post(f"/{self.ig_user}/media_publish", {"creation_id": creation_id})

    def ig_post_image(self, image_url: str, caption: str) -> dict:
        cid = self.ig_create_container(image_url, caption)
        pub = self.ig_publish(cid)
        return {"container_id": cid, "media_id": pub.get("id"), "raw": pub}

    def ig_recent_media(self, limit: int = 10) -> list[dict]:
        if not self.ig_user:
            raise MetaError("IG_BUSINESS_ACCOUNT_ID not configured")
        fields = "id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count"
        resp = self._get(f"/{self.ig_user}/media", {"fields": fields, "limit": limit})
        return resp.get("data", [])

    def ig_media_insights(self, media_id: str) -> dict:
        try:
            resp = self._get(
                f"/{media_id}/insights",
                {"metric": "impressions,reach,saved,engagement,likes,comments,shares"},
            )
        except MetaError:
            # Newer accounts expose different metric names; try the reduced set.
            resp = self._get(f"/{media_id}/insights", {"metric": "reach,likes,comments,saved"})
        out = {}
        for row in resp.get("data", []):
            name = row.get("name")
            values = row.get("values") or []
            if values:
                v = values[0].get("value")
                out[name] = v
        return out

    # ---- Competitors via IG Business Discovery ----
    def ig_business_discovery(self, competitor_username: str, media_limit: int = 6) -> dict:
        """Read a public IG business/creator account through *our* token.

        Requires our token to belong to an IG business account.
        """
        if not self.ig_user:
            raise MetaError("IG_BUSINESS_ACCOUNT_ID not configured")
        sub = (
            f"business_discovery.username({competitor_username}){{"
            f"username,name,biography,website,followers_count,media_count,"
            f"media.limit({media_limit}){{id,caption,media_type,timestamp,permalink,like_count,comments_count}}"
            f"}}"
        )
        return self._get(f"/{self.ig_user}", {"fields": sub})

    def fb_public_page(self, page_id: str, media_limit: int = 6) -> dict:
        fields = (
            "id,name,about,fan_count,followers_count,"
            f"posts.limit({media_limit}){{id,message,created_time,permalink_url,reactions.summary(true),comments.summary(true)}}"
        )
        return self._get(f"/{page_id}", {"fields": fields})


_client: MetaClient | None = None


def meta() -> MetaClient:
    global _client
    if _client is None:
        _client = MetaClient()
    return _client
