from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.application.audit import write_audit
from app.domain.enums import (
    ALLOWED_TRANSITIONS,
    STUDENT_CANCELLABLE,
    DifficultyStatus,
)
from app.infrastructure.catalog_client import assert_catalog_refs
from app.infrastructure.models import Difficulty
from app.infrastructure.outbox import EVENT_DIFFICULTY_SUBMITTED, enqueue_outbox


def create_difficulty(
    db: Session,
    *,
    student_id: UUID,
    level_code: str,
    subject_id: UUID,
    description: str,
    chapter_id: UUID | None,
    notion: str | None,
    preferences: str | None,
    correlation_id: str | None,
) -> Difficulty:
    cleaned_level = level_code.strip()
    assert_catalog_refs(
        level_code=cleaned_level,
        subject_id=subject_id,
        chapter_id=chapter_id,
    )
    row = Difficulty(
        student_id=student_id,
        level_code=cleaned_level,
        subject_id=subject_id,
        chapter_id=chapter_id,
        notion=(notion.strip() if notion else None),
        description=description.strip(),
        preferences=(preferences.strip() if preferences else None),
        status=DifficultyStatus.SUBMITTED.value,
    )
    db.add(row)
    db.flush()
    enqueue_outbox(
        db,
        event_type=EVENT_DIFFICULTY_SUBMITTED,
        correlation_id=correlation_id,
        payload={
            "difficulty_id": str(row.id),
            "student_id": str(student_id),
            "level_code": row.level_code,
            "subject_id": str(subject_id),
            "chapter_id": str(chapter_id) if chapter_id else None,
            "status": row.status,
        },
    )
    write_audit(
        db,
        action="difficulty.submitted",
        resource_type="difficulty",
        resource_id=str(row.id),
        actor_id=student_id,
        correlation_id=correlation_id,
        metadata={"level_code": row.level_code, "status": row.status},
    )
    db.commit()
    db.refresh(row)
    return row


def update_status(
    db: Session,
    *,
    difficulty_id: UUID,
    new_status_raw: str,
    actor_id: UUID,
    roles: frozenset[str],
    correlation_id: str | None,
) -> Difficulty:
    row = db.get(Difficulty, difficulty_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Demande introuvable")

    try:
        new_status = DifficultyStatus(new_status_raw)
        current = DifficultyStatus(row.status)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Statut invalide") from exc

    is_admin = "ADMIN" in roles
    is_owner = row.student_id == actor_id

    if not is_admin and not is_owner:
        raise HTTPException(status_code=403, detail="Accès refusé")

    if not is_admin:
        if new_status != DifficultyStatus.CANCELLED:
            raise HTTPException(
                status_code=403,
                detail="L'élève ne peut que annuler sa demande",
            )
        if current not in STUDENT_CANCELLABLE:
            raise HTTPException(
                status_code=409,
                detail="Annulation impossible dans cet état",
            )

    allowed = ALLOWED_TRANSITIONS.get(current, frozenset())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Transition interdite : {current.value} → {new_status.value}",
        )

    row.status = new_status.value
    row.updated_at = datetime.now(UTC)
    write_audit(
        db,
        action="difficulty.status_changed",
        resource_type="difficulty",
        resource_id=str(row.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"from": current.value, "to": new_status.value},
    )
    db.commit()
    db.refresh(row)
    return row
