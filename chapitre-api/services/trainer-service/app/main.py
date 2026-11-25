"""trainer-service — profils, validation, compétences, disponibilités."""

from fastapi import FastAPI

from app.api.trainers import router as trainers_router
from app.infrastructure.database import check_database

app = FastAPI(
    title="trainer-service",
    version="0.2.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.include_router(trainers_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "trainer-service"}


@app.get("/ready")
def ready() -> dict[str, str]:
    if not check_database():
        return {"status": "not_ready", "service": "trainer-service", "reason": "database"}
    return {"status": "ready", "service": "trainer-service"}
