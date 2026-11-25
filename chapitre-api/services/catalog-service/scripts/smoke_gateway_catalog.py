"""
Smoke gateway → catalog (Postgres seedé + services locaux).

Prérequis :
  docker compose -f infra/docker-compose.yml up -d
  alembic upgrade head && python -m scripts.seed_catalog
  uvicorn catalog :8002 + gateway :8000

Usage :
  cd chapitre-api\\services\\catalog-service
  $env:GATEWAY_URL = "http://127.0.0.1:8000"
  $env:CATALOG_URL = "http://127.0.0.1:8002"
  python -m scripts.smoke_gateway_catalog
"""

from __future__ import annotations

import os
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import uuid4

import httpx
import jwt

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def _mint_admin_token() -> str:
    secret = os.environ.get(
        "IDENTITY_JWT_SECRET",
        "dev-only-change-me-chapitre-identity-jwt-hs256",
    )
    issuer = os.environ.get("IDENTITY_JWT_ISSUER", "chapitre-identity")
    now = datetime.now(UTC)
    payload = {
        "sub": str(uuid4()),
        "roles": ["ADMIN"],
        "iss": issuer,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=15)).timestamp()),
        "typ": "access",
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def main() -> int:
    gateway = os.environ.get("GATEWAY_URL", "http://127.0.0.1:8000").rstrip("/")
    catalog = os.environ.get("CATALOG_URL", "http://127.0.0.1:8002").rstrip("/")
    timeout = httpx.Timeout(10.0)

    with httpx.Client(timeout=timeout) as client:
        gh = client.get(f"{gateway}/health")
        gh.raise_for_status()
        print(f"gateway /health → {gh.status_code}")

        ch = client.get(f"{catalog}/health")
        ch.raise_for_status()
        print(f"catalog /health → {ch.status_code}")

        levels = client.get(f"{gateway}/api/v1/catalog/levels")
        levels.raise_for_status()
        body = levels.json()
        codes = [item["code"] for item in body.get("levels", [])]
        assert codes == ["3e", "Terminale C", "Terminale D"], codes
        print(f"gateway /api/v1/catalog/levels → {codes}")

        subjects = client.get(
            f"{gateway}/api/v1/catalog/subjects", params={"level": "3e"}
        )
        subjects.raise_for_status()
        names = {item["name"] for item in subjects.json().get("items", [])}
        assert "Mathématiques" in names, names
        print(f"gateway subjects(3e) → {len(names)} matières")

        token = _mint_admin_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Correlation-ID": "smoke-gateway-catalog",
        }
        unique = f"Smoke-{uuid4().hex[:8]}"
        created = client.post(
            f"{gateway}/api/v1/catalog/admin/subjects",
            json={"name": unique, "level_codes": ["3e"]},
            headers=headers,
        )
        created.raise_for_status()
        assert created.status_code == 201
        print(f"gateway admin create subject → {created.json()['name']}")

        audit = client.get(
            f"{gateway}/api/v1/catalog/admin/audit",
            params={"limit": 10},
            headers=headers,
        )
        audit.raise_for_status()
        actions = {item["action"] for item in audit.json().get("items", [])}
        assert "subject.created" in actions, actions
        print("gateway admin audit → subject.created OK")

    print("SMOKE OK gateway→catalog")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"SMOKE FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
