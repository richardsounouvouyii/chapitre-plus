"""identity-service — phase 1 auth (register / login JWT / invitations)."""

from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.internal import router as internal_router
from app.api.roles import router as roles_router
from app.infrastructure.database import check_database

app = FastAPI(
    title="identity-service",
    version="0.4.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.include_router(roles_router)
app.include_router(auth_router)
app.include_router(internal_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "identity-service"}


@app.get("/ready")
def ready() -> dict[str, str]:
    if not check_database():
        return {"status": "not_ready", "service": "identity-service", "reason": "database"}
    return {"status": "ready", "service": "identity-service"}
