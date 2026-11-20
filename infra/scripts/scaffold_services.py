"""Génère les 9 squelettes FastAPI (phase 0) — exécuter une fois depuis la racine."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SERVICES_ROOT = ROOT / "chapitre-api" / "services"
SERVICES = [
    ("identity-service", 8001, "chapitre_identity", "DATABASE_URL_IDENTITY"),
    ("catalog-service", 8002, "chapitre_catalog", "DATABASE_URL_CATALOG"),
    ("difficulty-service", 8003, "chapitre_difficulty", "DATABASE_URL_DIFFICULTY"),
    ("trainer-service", 8004, "chapitre_trainer", "DATABASE_URL_TRAINER"),
    ("scheduling-service", 8005, "chapitre_scheduling", "DATABASE_URL_SCHEDULING"),
    ("booking-service", 8006, "chapitre_booking", "DATABASE_URL_BOOKING"),
    ("resource-service", 8007, "chapitre_resource", "DATABASE_URL_RESOURCE"),
    ("payment-service", 8008, "chapitre_payment", "DATABASE_URL_PAYMENT"),
    ("notification-service", 8009, "chapitre_notification", "DATABASE_URL_NOTIFICATION"),
]

REQUIREMENTS = """fastapi>=0.115.0
uvicorn[standard]>=0.32.0
pydantic>=2.9.0
pydantic-settings>=2.6.0
sqlalchemy>=2.0.36
psycopg[binary]>=3.2.0
alembic>=1.14.0
httpx>=0.27.0
pytest>=8.3.0
pytest-asyncio>=0.24.0
"""

MAIN_PY = '''"""{title} — squelette phase 0 (health uniquement)."""
from fastapi import FastAPI

app = FastAPI(
    title="{title}",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {{"status": "ok", "service": "{name}"}}


@app.get("/ready")
def ready() -> dict[str, str]:
    # Phase 0 : readiness minimale (DB/métier branchés aux phases suivantes).
    return {{"status": "ready", "service": "{name}"}}
'''

TEST_HEALTH = '''from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "{name}"


def test_ready() -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"
'''

DOCKERFILE = """FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
EXPOSE {port}
CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"{port}\"]
"""

README = """# {title}

Service FastAPI indépendant — phase 0 (health/readiness uniquement).

## Base dédiée
`{db}`

## Lancer en local
```powershell
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port {port}
```

## Tests
```powershell
pytest -q
```
"""

INIT_PY = ""


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def scaffold_service(name: str, port: int, db: str, _env_key: str) -> None:
    base = SERVICES_ROOT / name
    title = name
    write(base / "requirements.txt", REQUIREMENTS)
    write(base / "Dockerfile", DOCKERFILE.format(port=port))
    write(base / "README.md", README.format(title=title, db=db, port=port))
    write(base / "alembic.ini", f"# Placeholder phase 0 — migrations dès phase métier\n# database: {db}\n")
    write(base / "alembic" / "versions" / ".gitkeep", "")
    write(base / "app" / "__init__.py", INIT_PY)
    write(base / "app" / "main.py", MAIN_PY.format(title=title, name=name))
    write(base / "app" / "api" / "__init__.py", INIT_PY)
    write(base / "app" / "domain" / "__init__.py", INIT_PY)
    write(base / "app" / "application" / "__init__.py", INIT_PY)
    write(base / "app" / "infrastructure" / "__init__.py", INIT_PY)
    write(base / "tests" / "__init__.py", INIT_PY)
    write(base / "tests" / "test_health.py", TEST_HEALTH.format(name=name))
    print(f"OK {name} :{port} -> {db}")


def main() -> None:
    for name, port, db, env_key in SERVICES:
        scaffold_service(name, port, db, env_key)
    print("9 services générés.")


if __name__ == "__main__":
    main()
