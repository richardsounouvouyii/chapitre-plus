import json
from uuid import uuid4

from sqlalchemy import select

from app.infrastructure.models import DifficultyProjection, InboxEvent
from app.workers.difficulty_inbox_consumer import handle_delivery


def test_handle_delivery_acks_after_commit(db_session, monkeypatch) -> None:
    monkeypatch.setattr(
        "app.workers.difficulty_inbox_consumer.SessionLocal",
        lambda: db_session,
    )
    # Empêche close() de casser la fixture partagée
    monkeypatch.setattr(db_session, "close", lambda: None)

    difficulty_id = uuid4()
    event_id = uuid4()
    body = json.dumps(
        {
            "event_id": str(event_id),
            "event_type": "difficulty.submitted.v1",
            "payload": {
                "difficulty_id": str(difficulty_id),
                "student_id": str(uuid4()),
                "level_code": "3e",
                "subject_id": str(uuid4()),
                "status": "SUBMITTED",
            },
        }
    ).encode("utf-8")

    handle_delivery(body)
    assert db_session.get(DifficultyProjection, difficulty_id) is not None
    assert len(db_session.scalars(select(InboxEvent)).all()) == 1

    handle_delivery(body)  # idempotent
    assert len(db_session.scalars(select(InboxEvent)).all()) == 1


def test_handle_delivery_rejects_wrong_event_type(db_session, monkeypatch) -> None:
    monkeypatch.setattr(
        "app.workers.difficulty_inbox_consumer.SessionLocal",
        lambda: db_session,
    )
    monkeypatch.setattr(db_session, "close", lambda: None)
    body = json.dumps(
        {
            "event_id": str(uuid4()),
            "event_type": "other.event.v1",
            "payload": {},
        }
    ).encode("utf-8")
    try:
        handle_delivery(body)
        assert False, "expected ValueError"
    except ValueError:
        pass
