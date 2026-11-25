from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
from sqlalchemy import select

from app.infrastructure.inbox import process_difficulty_submitted
from app.infrastructure.models import DifficultyProjection, InboxEvent, OutboxEvent
from app.infrastructure.outbox import EVENT_TRAINER_APPROVED

SECRET = "test-jwt-secret-trainer-chapitre-hs256-32b"


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


def test_profile_competency_approve_outbox(client, db_session) -> None:
    trainer_user = uuid4()
    admin_user = uuid4()
    subject_id = uuid4()
    th = {"Authorization": f"Bearer {_token(roles=['TRAINER'], user_id=trainer_user)}"}
    ah = {"Authorization": f"Bearer {_token(roles=['ADMIN'], user_id=admin_user)}"}

    created = client.post("/trainers/me/profile", json={"bio": "Maths"}, headers=th)
    assert created.status_code == 201, created.text
    trainer_id = created.json()["id"]
    assert created.json()["status"] == "PENDING_VERIFICATION"

    comp = client.post(
        "/trainers/me/competencies",
        json={"level_code": "3e", "subject_id": str(subject_id)},
        headers=th,
    )
    assert comp.status_code == 201

    avail = client.post(
        "/trainers/me/availabilities",
        json={
            "weekday": 5,
            "start_time": "09:00:00",
            "end_time": "12:00:00",
            "timezone": "Africa/Porto-Novo",
        },
        headers=th,
    )
    assert avail.status_code == 201

    denied = client.post(f"/trainers/{trainer_id}/approve", headers=th)
    assert denied.status_code == 403

    approved = client.post(f"/trainers/{trainer_id}/approve", headers=ah)
    assert approved.status_code == 200
    assert approved.json()["status"] == "APPROVED"

    events = db_session.scalars(select(OutboxEvent)).all()
    assert len(events) == 1
    assert events[0].event_type == EVENT_TRAINER_APPROVED
    assert "bio" not in events[0].payload

    illegal = client.post(f"/trainers/{trainer_id}/reject", headers=ah)
    assert illegal.status_code == 409


def test_inbox_idempotent_and_compatible(client, db_session) -> None:
    trainer_user = uuid4()
    admin_user = uuid4()
    subject_id = uuid4()
    th = {"Authorization": f"Bearer {_token(roles=['TRAINER'], user_id=trainer_user)}"}
    ah = {"Authorization": f"Bearer {_token(roles=['ADMIN'], user_id=admin_user)}"}

    profile = client.post("/trainers/me/profile", json={}, headers=th).json()
    client.post(
        "/trainers/me/competencies",
        json={"level_code": "3e", "subject_id": str(subject_id)},
        headers=th,
    )
    client.post(f"/trainers/{profile['id']}/approve", headers=ah)

    difficulty_id = uuid4()
    event_id = uuid4()
    envelope = {
        "event_id": str(event_id),
        "event_type": "difficulty.submitted.v1",
        "payload": {
            "difficulty_id": str(difficulty_id),
            "student_id": str(uuid4()),
            "level_code": "3e",
            "subject_id": str(subject_id),
            "status": "SUBMITTED",
        },
    }
    assert process_difficulty_submitted(db_session, envelope) is True
    assert process_difficulty_submitted(db_session, envelope) is False
    assert db_session.get(DifficultyProjection, difficulty_id) is not None
    assert len(db_session.scalars(select(InboxEvent)).all()) == 1

    compatible = client.get("/trainers/compatible-difficulties", headers=th)
    assert compatible.status_code == 200
    items = compatible.json()["items"]
    assert len(items) == 1
    assert items[0]["difficulty_id"] == str(difficulty_id)
