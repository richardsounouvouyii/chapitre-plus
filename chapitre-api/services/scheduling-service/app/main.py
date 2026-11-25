"""scheduling-service — lieux, séances, tarifs, publications."""

from fastapi import FastAPI

from app.api.scheduling import router as scheduling_router
from app.infrastructure.database import check_database

app = FastAPI(
    title="scheduling-service",
    version="0.2.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.include_router(scheduling_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "scheduling-service"}


@app.get("/ready")
def ready() -> dict[str, str]:
    if not check_database():
        return {
            "status": "not_ready",
            "service": "scheduling-service",
            "reason": "database",
        }
    return {"status": "ready", "service": "scheduling-service"}
