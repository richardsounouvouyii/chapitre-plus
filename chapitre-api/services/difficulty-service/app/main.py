"""difficulty-service — demandes textuelles élèves + outbox."""

from fastapi import FastAPI

from app.api.difficulties import router as difficulties_router
from app.infrastructure.database import check_database

app = FastAPI(
    title="difficulty-service",
    version="0.2.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.include_router(difficulties_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "difficulty-service"}


@app.get("/ready")
def ready() -> dict[str, str]:
    if not check_database():
        return {
            "status": "not_ready",
            "service": "difficulty-service",
            "reason": "database",
        }
    return {"status": "ready", "service": "difficulty-service"}
