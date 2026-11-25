"""
Smoke : venue → session DRAFT → submit → approve-price → PUBLISHED.

Prérequis : scheduling :8005, trainer :8004 (formateur APPROVED), JWT secret aligné.

  python -m scripts.smoke_scheduling_flow
"""

from __future__ import annotations

import os
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import UUID, uuid4

import httpx
import jwt

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def _token(*, roles: list[str], user_id: UUID | None = None) -> str:
    secret = os.environ.get(
        "IDENTITY_JWT_SECRET", "dev-only-change-me-chapitre-identity-jwt-hs256"
    )
    issuer = os.environ.get("IDENTITY_JWT_ISSUER", "chapitre-identity")
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "sub": str(user_id or uuid4()),
            "roles": roles,
            "iss": issuer,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=15)).timestamp()),
            "typ": "access",
        },
        secret,
        algorithm="HS256",
    )


def main() -> int:
    scheduling = os.environ.get("SCHEDULING_URL", "http://127.0.0.1:8005").rstrip("/")
    trainer = os.environ.get("TRAINER_URL", "http://127.0.0.1:8004").rstrip("/")
    catalog = os.environ.get("CATALOG_URL", "http://127.0.0.1:8002").rstrip("/")
    gateway = os.environ.get("GATEWAY_URL", "http://127.0.0.1:8000").rstrip("/")

    trainer_user = uuid4()
    th = {"Authorization": f"Bearer {_token(roles=['TRAINER'], user_id=trainer_user)}"}
    ah = {"Authorization": f"Bearer {_token(roles=['ADMIN'])}"}

    with httpx.Client(timeout=15.0) as client:
        # Formateur APPROVED
        profile = client.post(f"{trainer}/trainers/me/profile", json={"bio": "Smoke"}, headers=th)
        profile.raise_for_status()
        trainer_id = profile.json()["id"]
        subjects = client.get(f"{catalog}/subjects", params={"level": "3e"})
        subjects.raise_for_status()
        subject_id = subjects.json()["items"][0]["id"]
        client.post(
            f"{trainer}/trainers/me/competencies",
            headers=th,
            json={"level_code": "3e", "subject_id": subject_id},
        ).raise_for_status()
        client.post(f"{trainer}/trainers/{trainer_id}/approve", headers=ah).raise_for_status()
        print(f"trainer APPROVED → {trainer_id}")

        venue = client.post(
            f"{scheduling}/venues",
            headers=ah,
            json={
                "name": f"Smoke Venue {uuid4().hex[:6]}",
                "address": "Avenue Smoke",
                "city": "Cotonou",
                "capacity_hint": 12,
            },
        )
        venue.raise_for_status()
        venue_id = venue.json()["id"]
        print(f"venue → {venue_id}")

        starts = datetime.now(UTC) + timedelta(days=3)
        ends = starts + timedelta(hours=2)
        session = client.post(
            f"{scheduling}/sessions",
            headers=th,
            json={
                "venue_id": venue_id,
                "level_code": "3e",
                "subject_id": subject_id,
                "title": "Smoke séance Maths",
                "starts_at": starts.isoformat(),
                "ends_at": ends.isoformat(),
                "capacity": 6,
                "price_xof": 3000,
            },
        )
        session.raise_for_status()
        sid = session.json()["id"]
        assert session.json()["status"] == "DRAFT"
        print(f"session DRAFT → {sid}")

        client.post(f"{scheduling}/sessions/{sid}/submit", headers=th).raise_for_status()
        published = client.post(
            f"{scheduling}/sessions/{sid}/approve-price", headers=ah
        )
        published.raise_for_status()
        assert published.json()["status"] == "PUBLISHED"
        assert published.json()["price_status"] == "APPROVED"
        print("session PUBLISHED + price APPROVED")

        # Proxy gateway
        via_gw = client.get(
            f"{gateway}/api/v1/scheduling/sessions/{sid}",
            headers=ah,
        )
        via_gw.raise_for_status()
        assert via_gw.json()["id"] == sid
        print("gateway /api/v1/scheduling OK")

        # Chevauchement
        clash = client.post(
            f"{scheduling}/sessions",
            headers=th,
            json={
                "venue_id": venue_id,
                "level_code": "3e",
                "subject_id": subject_id,
                "title": "Clash",
                "starts_at": (starts + timedelta(minutes=30)).isoformat(),
                "ends_at": (ends + timedelta(minutes=30)).isoformat(),
                "capacity": 4,
                "price_xof": 2000,
            },
        )
        assert clash.status_code == 409, clash.text
        print("overlap 409 OK")

    print("SMOKE OK scheduling flow")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"SMOKE FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
