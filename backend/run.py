"""Convenience entrypoint: `python run.py` = uvicorn on APP_PORT."""
import uvicorn
from app.config import get_settings

if __name__ == "__main__":
    s = get_settings()
    uvicorn.run("app.main:app", host="0.0.0.0", port=s.app_port, reload=False)
