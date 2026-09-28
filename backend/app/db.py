"""SQLite mirror of durable facts we need to look up fast without hitting Hindsight.

Hindsight is the *brain*; SQLite is the *filing cabinet* — post IDs, publish
schedules, competitor lists, brand config. Anything the agent 'reasons over'
lives in Hindsight; anything we just look up by primary key lives here.
"""
from __future__ import annotations
import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from .config import get_settings


SCHEMA = """
CREATE TABLE IF NOT EXISTS brand (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    tagline TEXT,
    voice TEXT,
    audience TEXT,
    pillars_json TEXT,
    website TEXT,
    ig_username TEXT,
    fb_page_id TEXT,
    ig_business_account_id TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS calendar_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduled_for TEXT NOT NULL,
    channels TEXT NOT NULL,
    pillar TEXT,
    hook TEXT,
    caption TEXT,
    hashtags TEXT,
    image_prompt TEXT,
    image_url TEXT,
    cta_link TEXT,
    status TEXT DEFAULT 'draft',
    rationale TEXT,
    memory_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calendar_item_id INTEGER,
    channel TEXT NOT NULL,
    external_id TEXT,
    permalink TEXT,
    caption TEXT,
    image_url TEXT,
    posted_at TEXT DEFAULT (datetime('now')),
    metrics_json TEXT,
    last_metrics_at TEXT,
    FOREIGN KEY (calendar_item_id) REFERENCES calendar_item(id)
);

CREATE TABLE IF NOT EXISTS competitor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handle TEXT UNIQUE NOT NULL,
    channel TEXT NOT NULL,
    display_name TEXT,
    last_synced_at TEXT
);

CREATE TABLE IF NOT EXISTS competitor_post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor_id INTEGER NOT NULL,
    external_id TEXT,
    caption TEXT,
    posted_at TEXT,
    permalink TEXT,
    likes INTEGER,
    comments INTEGER,
    memory_id TEXT,
    FOREIGN KEY (competitor_id) REFERENCES competitor(id)
);

CREATE TABLE IF NOT EXISTS chat_turn (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    tool_calls TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
"""


def _dict_factory(cursor: sqlite3.Cursor, row: tuple) -> dict[str, Any]:
    return {col[0]: row[i] for i, col in enumerate(cursor.description)}


@contextmanager
def conn() -> Iterator[sqlite3.Connection]:
    s = get_settings()
    path = Path(s.sqlite_path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parent.parent / s.sqlite_path
    path.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(path)
    c.row_factory = _dict_factory
    c.execute("PRAGMA journal_mode=WAL;")
    c.execute("PRAGMA foreign_keys=ON;")
    try:
        yield c
        c.commit()
    finally:
        c.close()


def init_db() -> None:
    with conn() as c:
        c.executescript(SCHEMA)


def json_dumps(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, default=str)


def json_loads(s: str | None) -> Any:
    if not s:
        return None
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        return None
