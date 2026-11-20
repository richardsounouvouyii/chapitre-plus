"""catalog-service — phase 0 + référentiel niveaux MVP."""

from fastapi import FastAPI

from app.api.levels import router as levels_router

app = FastAPI(
    title="catalog-service",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.include_router(levels_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "catalog-service"}


@app.get("/ready")
def ready() -> dict[str, str]:
    # Phase 0 : readiness minimale (DB/métier branchés aux phases suivantes).
    return {"status": "ready", "service": "catalog-service"}
