from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
from sqlalchemy import select

from app.infrastructure.models import OutboxEvent
from app.infrastructure.outbox import EVENT_DIFFICULTY_SUBMITTED

SECRET = "test-jwt-secret-difficulty-chapitre-hs256-32b"


def _token(*, roles: list[str], user_id=None) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id or uuid4()),
        "roles": roles,
        "iss": "chapitre-identity",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=15)).timestamp()),
        "typ": "access",
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")


def test_create_requires_auth(client) -> None:
    response = client.post(
        "/difficulties",
        json={
            "level_code": "3e",
            "subject_id": str(uuid4()),
            "description": "Je bloque sur les équations du second degré.",
        },
    )
    assert response.status_code == 401


def test_student_create_list_and_outbox(client, db_session) -> None:
    student_id = uuid4()
    headers = {"Authorization": f"Bearer {_token(roles=['STUDENT'], user_id=student_id)}"}
    subject_id = uuid4()
    created = client.post(
        "/difficulties",
        json={
            "level_code": "3e",
            "subject_id": str(subject_id),
            "description": "Je bloque sur les équations du second degré.",
            "preferences": "Présentiel le week-end",
        },
        headers=headers,
    )
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["status"] == "SUBMITTED"
    assert body["student_id"] == str(student_id)

    listed = client.get("/difficulties", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()["items"]) == 1

    events = db_session.scalars(select(OutboxEvent)).all()
    assert len(events) == 1
    assert events[0].event_type == EVENT_DIFFICULTY_SUBMITTED
    assert "description" not in events[0].payload
    assert events[0].payload["student_id"] == str(student_id)


def test_student_isolation(client) -> None:
    a = uuid4()
    b = uuid4()
    subject_id = uuid4()
    client.post(
        "/difficulties",
        json={
            "level_code": "3e",
            "subject_id": str(subject_id),
            "description": "Demande élève A pour isolation.",
        },
        headers={"Authorization": f"Bearer {_token(roles=['STUDENT'], user_id=a)}"},
    )
    listed = client.get(
        "/difficulties",
        headers={"Authorization": f"Bearer {_token(roles=['STUDENT'], user_id=b)}"},
    )
    assert listed.json()["items"] == []


def test_status_transitions(client) -> None:
    student_id = uuid4()
    admin_id = uuid4()
    student_h = {"Authorization": f"Bearer {_token(roles=['STUDENT'], user_id=student_id)}"}
    admin_h = {"Authorization": f"Bearer {_token(roles=['ADMIN'], user_id=admin_id)}"}
    created = client.post(
        "/difficulties",
        json={
            "level_code": "3e",
            "subject_id": str(uuid4()),
            "description": "Transition de statut à tester ici.",
        },
        headers=student_h,
    )
    did = created.json()["id"]

    bad = client.patch(
        f"/difficulties/{did}/status",
        json={"status": "SCHEDULED"},
        headers=admin_h,
    )
    assert bad.status_code == 409

    ok = client.patch(
        f"/difficulties/{did}/status",
        json={"status": "IN_REVIEW"},
        headers=admin_h,
    )
    assert ok.status_code == 200
    assert ok.json()["status"] == "IN_REVIEW"

    cancel = client.patch(
        f"/difficulties/{did}/status",
        json={"status": "CANCELLED"},
        headers=student_h,
    )
    assert cancel.status_code == 200
    assert cancel.json()["status"] == "CANCELLED"
