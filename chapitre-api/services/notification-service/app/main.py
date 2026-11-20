"""notification-service — squelette phase 0 (health uniquement)."""
from fastapi import FastAPI

app = FastAPI(
    title="notification-service",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "notification-service"}


@app.get("/ready")
def ready() -> dict[str, str]:
    # Phase 0 : readiness minimale (DB/métier branchés aux phases suivantes).
    return {"status": "ready", "service": "notification-service"}
