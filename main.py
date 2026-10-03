# Re-export app from backend.main for convenience when running uvicorn from root
from backend.main import app

__all__ = ["app"]
