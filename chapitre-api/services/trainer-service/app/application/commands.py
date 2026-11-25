from __future__ import annotations

from datetime import UTC, datetime, time
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.audit import write_audit
from app.domain.enums import ALLOWED_TRANSITIONS, TrainerStatus
from app.infrastructure.models import (
    TrainerAvailability,
    TrainerCompetency,
    TrainerProfile,
)
from app.infrastructure.outbox import EVENT_TRAINER_APPROVED, enqueue_outbox


def create_profile(
    db: Session,
    *,
    user_id: UUID,
    bio: str | None,
    correlation_id: str | None,
) -> TrainerProfile:
    existing = db.scalars(
        select(TrainerProfile).where(TrainerProfile.user_id == user_id)
    ).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Profil formateur déjà existant")
    row = TrainerProfile(
        user_id=user_id,
        bio=(bio.strip() if bio else None),
        status=TrainerStatus.PENDING_VERIFICATION.value,
    )
    db.add(row)
    db.flush()
    write_audit(
        db,
        action="trainer.profile_created",
        resource_type="trainer",
        resource_id=str(row.id),
        actor_id=user_id,
        correlation_id=correlation_id,
        metadata={"status": row.status},
    )
    db.commit()
    db.refresh(row)
    return row


def add_competency(
    db: Session,
    *,
    user_id: UUID,
    level_code: str,
    subject_id: UUID,
    correlation_id: str | None,
) -> TrainerCompetency:
    profile = _own_profile(db, user_id)
    clash = db.scalars(
        select(TrainerCompetency).where(
            TrainerCompetency.trainer_id == profile.id,
            TrainerCompetency.level_code == level_code,
            TrainerCompetency.subject_id == subject_id,
        )
    ).first()
    if clash is not None:
        raise HTTPException(status_code=409, detail="Compétence déjà enregistrée")
    row = TrainerCompetency(
        trainer_id=profile.id,
        level_code=level_code.strip(),
        subject_id=subject_id,
    )
    db.add(row)
    db.flush()
    write_audit(
        db,
        action="trainer.competency_added",
        resource_type="competency",
        resource_id=str(row.id),
        actor_id=user_id,
        correlation_id=correlation_id,
        metadata={"level_code": row.level_code, "subject_id": str(subject_id)},
    )
    db.commit()
    db.refresh(row)
    return row


def delete_competency(db: Session, *, user_id: UUID, competency_id: UUID) -> None:
    profile = _own_profile(db, user_id)
    row = db.get(TrainerCompetency, competency_id)
    if row is None or row.trainer_id != profile.id:
        raise HTTPException(status_code=404, detail="Compétence introuvable")
    db.delete(row)
    db.commit()


def add_availability(
    db: Session,
    *,
    user_id: UUID,
    weekday: int,
    start_time: time,
    end_time: time,
    timezone: str,
    correlation_id: str | None,
) -> TrainerAvailability:
    profile = _own_profile(db, user_id)
    if end_time <= start_time:
        raise HTTPException(status_code=422, detail="Plage horaire invalide")
    row = TrainerAvailability(
        trainer_id=profile.id,
        weekday=weekday,
        start_time=start_time,
        end_time=end_time,
        timezone=timezone,
        is_active=True,
    )
    db.add(row)
    db.flush()
    write_audit(
        db,
        action="trainer.availability_added",
        resource_type="availability",
        resource_id=str(row.id),
        actor_id=user_id,
        correlation_id=correlation_id,
        metadata={"weekday": weekday},
    )
    db.commit()
    db.refresh(row)
    return row


def delete_availability(db: Session, *, user_id: UUID, availability_id: UUID) -> None:
    profile = _own_profile(db, user_id)
    row = db.get(TrainerAvailability, availability_id)
    if row is None or row.trainer_id != profile.id:
        raise HTTPException(status_code=404, detail="Disponibilité introuvable")
    db.delete(row)
    db.commit()


def transition_status(
    db: Session,
    *,
    trainer_id: UUID,
    new_status: TrainerStatus,
    actor_id: UUID,
    correlation_id: str | None,
) -> TrainerProfile:
    row = db.get(TrainerProfile, trainer_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Formateur introuvable")
    try:
        current = TrainerStatus(row.status)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail="Statut corrompu") from exc
    allowed = ALLOWED_TRANSITIONS.get(current, frozenset())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Transition interdite : {current.value} → {new_status.value}",
        )
    row.status = new_status.value
    row.updated_at = datetime.now(UTC)
    if new_status == TrainerStatus.APPROVED:
        enqueue_outbox(
            db,
            event_type=EVENT_TRAINER_APPROVED,
            correlation_id=correlation_id,
            payload={
                "trainer_id": str(row.id),
                "user_id": str(row.user_id),
                "status": row.status,
            },
        )
    write_audit(
        db,
        action="trainer.status_changed",
        resource_type="trainer",
        resource_id=str(row.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"from": current.value, "to": new_status.value},
    )
    db.commit()
    db.refresh(row)
    return row


def _own_profile(db: Session, user_id: UUID) -> TrainerProfile:
    profile = db.scalars(
        select(TrainerProfile).where(TrainerProfile.user_id == user_id)
    ).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="Profil formateur introuvable")
    return profile
