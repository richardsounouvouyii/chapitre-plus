"""
Smoke E2E : difficulté → outbox → RabbitMQ → inbox trainer → projection.

Prérequis : catalog :8002, difficulty :8003, trainer :8004,
  outbox_publisher difficulty, difficulty_inbox_consumer,
  Postgres + RabbitMQ.

  python -m scripts.smoke_difficulty_trainer_flow
"""

from __future__ import annotations

import os
import sys
import time
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
    catalog = os.environ.get("CATALOG_URL", "http://127.0.0.1:8002").rstrip("/")
    difficulty = os.environ.get("DIFFICULTY_URL", "http://127.0.0.1:8003").rstrip("/")
    trainer = os.environ.get("TRAINER_URL", "http://127.0.0.1:8004").rstrip("/")
    timeout = httpx.Timeout(10.0)

    with httpx.Client(timeout=timeout) as client:
        subjects = client.get(f"{catalog}/subjects", params={"level": "3e"})
        subjects.raise_for_status()
        items = subjects.json().get("items") or []
        maths = next(i for i in items if i.get("name") == "Mathématiques")
        subject_id = maths["id"]
        print(f"catalog subject Mathématiques → {subject_id}")

        student_h = {"Authorization": f"Bearer {_token(roles=['STUDENT'])}"}
        created = client.post(
            f"{difficulty}/difficulties",
            headers=student_h,
            json={
                "level_code": "3e",
                "subject_id": subject_id,
                "description": "Smoke E2E : équations du second degré, discriminant.",
                "preferences": "Week-end matin",
            },
        )
        created.raise_for_status()
        difficulty_id = created.json()["id"]
        print(f"difficulty created → {difficulty_id}")

        trainer_user = uuid4()
        th = {
            "Authorization": f"Bearer {_token(roles=['TRAINER'], user_id=trainer_user)}"
        }
        ah = {"Authorization": f"Bearer {_token(roles=['ADMIN'])}"}

        profile = client.post(f"{trainer}/trainers/me/profile", json={}, headers=th)
        profile.raise_for_status()
        trainer_id = profile.json()["id"]

        comp = client.post(
            f"{trainer}/trainers/me/competencies",
            headers=th,
            json={"level_code": "3e", "subject_id": subject_id},
        )
        comp.raise_for_status()

        approve = client.post(f"{trainer}/trainers/{trainer_id}/approve", headers=ah)
        approve.raise_for_status()
        print(f"trainer approved → {trainer_id}")

        deadline = time.time() + 45
        found = False
        while time.time() < deadline:
            compat = client.get(
                f"{trainer}/trainers/compatible-difficulties", headers=th
            )
            if compat.status_code == 200:
                ids = {i["difficulty_id"] for i in compat.json().get("items", [])}
                if difficulty_id in ids:
                    found = True
                    break
            time.sleep(1.5)

        if not found:
            print("SMOKE FAILED: projection absente après 45s", file=sys.stderr)
            return 1
        print("projection compatible OK")
        print("SMOKE OK difficulty→trainer event flow")
        return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"SMOKE FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
