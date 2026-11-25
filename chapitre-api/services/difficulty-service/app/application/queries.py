from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.models import Difficulty


def get_difficulty(
    db: Session,
    *,
    difficulty_id: UUID,
    actor_id: UUID,
    roles: frozenset[str],
) -> Difficulty:
    row = db.get(Difficulty, difficulty_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    if "ADMIN" not in roles and row.student_id != actor_id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return row


def list_difficulties(
    db: Session,
    *,
    actor_id: UUID,
    roles: frozenset[str],
    student_id: UUID | None = None,
) -> list[Difficulty]:
    stmt = select(Difficulty).order_by(Difficulty.created_at.desc())
    if "ADMIN" in roles:
        if student_id is not None:
            stmt = stmt.where(Difficulty.student_id == student_id)
    else:
        stmt = stmt.where(Difficulty.student_id == actor_id)
    return list(db.scalars(stmt).all())
