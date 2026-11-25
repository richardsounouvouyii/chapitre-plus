from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
from sqlalchemy import select

from app.infrastructure.models import OutboxEvent
from app.infrastructure.outbox import EVENT_SESSION_PUBLISHED

SECRET = "test-jwt-secret-scheduling-chapitre-hs256-32b"


def _token(*, roles: list[str], user_id=None) -> str:
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "sub": str(user_id or uuid4()),
            "roles": roles,
            "iss": "chapitre-identity",
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=15)).timestamp()),
            "typ": "access",
        },
        SECRET,
        algorithm="HS256",
    )


def _venue(client, admin_h):
    r = client.post(
        "/venues",
        headers=admin_h,
        json={
            "name": "Centre Akpakpa",
            "address": "Rue 12",
            "city": "Cotonou",
            "capacity_hint": 20,
        },
    )
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_create_submit_approve_publish_and_overlap(client, db_session) -> None:
    trainer_user = uuid4()
    admin = uuid4()
    th = {"Authorization": f"Bearer {_token(roles=['TRAINER'], user_id=trainer_user)}"}
    ah = {"Authorization": f"Bearer {_token(roles=['ADMIN'], user_id=admin)}"}
    venue_id = _venue(client, ah)

    starts = datetime(2026, 12, 1, 9, 0, tzinfo=UTC)
    ends = datetime(2026, 12, 1, 11, 0, tzinfo=UTC)
    created = client.post(
        "/sessions",
        headers=th,
        json={
            "venue_id": venue_id,
            "level_code": "3e",
            "subject_id": str(uuid4()),
            "title": "Équations 3e",
            "starts_at": starts.isoformat(),
            "ends_at": ends.isoformat(),
            "capacity": 8,
            "price_xof": 2500,
        },
    )
    assert created.status_code == 201, created.text
    sid = created.json()["id"]
    assert created.json()["status"] == "DRAFT"
    assert created.json()["price_status"] == "PROPOSED"

    # Chevauchement
    clash = client.post(
        "/sessions",
        headers=th,
        json={
            "venue_id": venue_id,
            "level_code": "3e",
            "subject_id": str(uuid4()),
            "title": "Autre",
            "starts_at": datetime(2026, 12, 1, 10, 0, tzinfo=UTC).isoformat(),
            "ends_at": datetime(2026, 12, 1, 12, 0, tzinfo=UTC).isoformat(),
            "capacity": 5,
            "price_xof": 2000,
        },
    )
    assert clash.status_code == 409

    submitted = client.post(f"/sessions/{sid}/submit", headers=th)
    assert submitted.status_code == 200
    assert submitted.json()["status"] == "PENDING_APPROVAL"

    published = client.post(f"/sessions/{sid}/approve-price", headers=ah)
    assert published.status_code == 200, published.text
    assert published.json()["status"] == "PUBLISHED"
    assert published.json()["price_status"] == "APPROVED"

    events = db_session.scalars(select(OutboxEvent)).all()
    assert any(e.event_type == EVENT_SESSION_PUBLISHED for e in events)


def test_unapproved_trainer_blocked(client, monkeypatch) -> None:
    from fastapi import HTTPException

    def _fail(**kwargs):  # noqa: ANN001
        raise HTTPException(status_code=403, detail="Formateur non approuvé — offre payante interdite")

    monkeypatch.setattr("app.application.commands.assert_trainer_approved", _fail)
    admin_h = {"Authorization": f"Bearer {_token(roles=['ADMIN'])}"}
    venue_id = _venue(client, admin_h)
    th = {"Authorization": f"Bearer {_token(roles=['TRAINER'])}"}
    r = client.post(
        "/sessions",
        headers=th,
        json={
            "venue_id": venue_id,
            "level_code": "3e",
            "subject_id": str(uuid4()),
            "title": "Bloqué",
            "starts_at": datetime(2026, 12, 2, 9, 0, tzinfo=UTC).isoformat(),
            "ends_at": datetime(2026, 12, 2, 10, 0, tzinfo=UTC).isoformat(),
            "capacity": 4,
            "price_xof": 1000,
        },
    )
    assert r.status_code == 403
