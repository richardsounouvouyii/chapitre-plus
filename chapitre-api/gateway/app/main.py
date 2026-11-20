"""API Gateway CHAPITRE+ — point d'entrée public (phase 0 : health + proxy stub)."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="chapitre-gateway",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "gateway"}


@app.get("/ready")
def ready() -> dict[str, str]:
    return {"status": "ready", "service": "gateway"}


@app.get("/api/v1/health")
def api_v1_health() -> dict[str, str]:
    """Health public versionné — consommé par le front en phase 0."""
    return {"status": "ok", "service": "gateway", "api": "v1"}
