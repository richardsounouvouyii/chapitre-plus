from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.domain.enums import TrainerStatus
from app.infrastructure.models import (
    DifficultyProjection,
    TrainerCompetency,
    TrainerProfile,
)


def get_me(db: Session, *, user_id: UUID) -> TrainerProfile:
    row = db.scalars(
        select(TrainerProfile)
        .where(TrainerProfile.user_id == user_id)
        .options(
            selectinload(TrainerProfile.competencies),
            selectinload(TrainerProfile.availabilities),
        )
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Profil formateur introuvable")
    return row


def list_trainers(db: Session) -> list[TrainerProfile]:
    return list(
        db.scalars(
            select(TrainerProfile)
            .options(
                selectinload(TrainerProfile.competencies),
                selectinload(TrainerProfile.availabilities),
            )
            .order_by(TrainerProfile.created_at.desc())
        ).all()
    )


def compatible_difficulties(db: Session, *, user_id: UUID) -> list[DifficultyProjection]:
    profile = get_me(db, user_id=user_id)
    if profile.status != TrainerStatus.APPROVED.value:
        raise HTTPException(
            status_code=403,
            detail="Formateur non approuvé",
        )
    comps = list(
        db.scalars(
            select(TrainerCompetency).where(TrainerCompetency.trainer_id == profile.id)
        ).all()
    )
    if not comps:
        return []
    pairs = {(c.level_code, c.subject_id) for c in comps}
    rows = db.scalars(select(DifficultyProjection)).all()
    return [r for r in rows if (r.level_code, r.subject_id) in pairs]
