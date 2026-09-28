from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    hindsight_base_url: str = "https://hindsight.vectorize.io"
    hindsight_api_key: str = ""
    hindsight_bank_id: str = "northpulse"

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"

    meta_access_token: str = ""
    meta_graph_version: str = "v21.0"
    fb_page_id: str = ""
    ig_business_account_id: str = ""

    competitor_ig_usernames: str = ""
    competitor_fb_page_ids: str = ""

    app_env: str = "dev"
    app_port: int = 8000
    frontend_origin: str = "http://localhost:5173"
    sqlite_path: str = "./recall.db"

    @property
    def competitor_ig_list(self) -> list[str]:
        return [s.strip() for s in self.competitor_ig_usernames.split(",") if s.strip()]

    @property
    def competitor_fb_list(self) -> list[str]:
        return [s.strip() for s in self.competitor_fb_page_ids.split(",") if s.strip()]


@lru_cache
def get_settings() -> Settings:
    root = Path(__file__).resolve().parent.parent
    env_path = root / ".env"
    if env_path.exists():
        import os
        os.chdir(root)
    return Settings()
