"""FastAPI entrypoint for Recall."""
from __future__ import annotations
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import init_db
from .routes import agent as agent_routes
from .routes import content as content_routes
from .routes import competitors as competitor_routes
from .routes import memory as memory_routes
from .routes import brand as brand_routes
from .routes import studio as studio_routes
from .routes import system as system_routes


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s :: %(message)s")


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title="Recall — Memory-First Marketing Agent", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[s.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        init_db()
        logging.getLogger("recall").info("DB ready at %s", s.sqlite_path)

    app.include_router(system_routes.router)
    app.include_router(brand_routes.router)
    app.include_router(agent_routes.router)
    app.include_router(content_routes.router)
    app.include_router(competitor_routes.router)
    app.include_router(memory_routes.router)
    app.include_router(studio_routes.router)

    return app


app = create_app()
