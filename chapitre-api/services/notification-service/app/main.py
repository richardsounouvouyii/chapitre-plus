"""notification-service — inbox Postgres + invitations + health."""

from fastapi import FastAPI

from app.api.invitations import router as invitations_router
from app.infrastructure.database import check_database

app = FastAPI(
    title="notification-service",
    version="0.3.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.include_router(invitations_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "notification-service"}


@app.get("/ready")
def ready() -> dict[str, str]:
    if not check_database():
        return {
            "status": "not_ready",
            "service": "notification-service",
            "reason": "database",
        }
    return {"status": "ready", "service": "notification-service"}
