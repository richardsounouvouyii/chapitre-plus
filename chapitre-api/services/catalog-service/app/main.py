"""catalog-service — référentiels niveaux / matières / chapitres / notions."""

from fastapi import FastAPI

from app.api.admin import router as admin_router
from app.api.catalog import router as catalog_router
from app.infrastructure.database import check_database

app = FastAPI(
    title="catalog-service",
    version="0.3.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.include_router(catalog_router)
app.include_router(admin_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "catalog-service"}


@app.get("/ready")
def ready() -> dict[str, str]:
    if not check_database():
        return {"status": "not_ready", "service": "catalog-service", "reason": "database"}
    return {"status": "ready", "service": "catalog-service"}
