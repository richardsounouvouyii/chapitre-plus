"""Inbox idempotente — consomme difficulty.submitted.v1."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.models import DifficultyProjection, InboxEvent

EVENT_DIFFICULTY_SUBMITTED = "difficulty.submitted.v1"


def process_difficulty_submitted(db: Session, envelope: dict[str, Any]) -> bool:
    """
    Traite un événement (idempotent par event_id).
    Retourne True si nouvellement traité, False si déjà vu.
    """
    event_id = UUID(str(envelope["event_id"]))
    existing = db.scalars(
        select(InboxEvent).where(InboxEvent.event_id == event_id)
    ).first()
    if existing is not None:
        return False

    payload = envelope.get("payload") or {}
    difficulty_id = UUID(str(payload["difficulty_id"]))
    level_code = str(payload["level_code"])
    subject_id = UUID(str(payload["subject_id"]))
    status = str(payload.get("status") or "SUBMITTED")

    projection = db.get(DifficultyProjection, difficulty_id)
    if projection is None:
        db.add(
            DifficultyProjection(
                difficulty_id=difficulty_id,
                level_code=level_code,
                subject_id=subject_id,
                status=status,
                received_at=datetime.now(UTC),
            )
        )
    else:
        projection.level_code = level_code
        projection.subject_id = subject_id
        projection.status = status

    db.add(
        InboxEvent(
            event_id=event_id,
            event_type=str(envelope.get("event_type") or EVENT_DIFFICULTY_SUBMITTED),
            payload=payload,
            processed_at=datetime.now(UTC),
        )
    )
    db.commit()
    return True
