from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.application.audit import write_audit
from app.domain.enums import (
    ALLOWED_SESSION_TRANSITIONS,
    PriceStatus,
    SessionStatus,
)
from app.infrastructure.models import TutoringSession, Venue
from app.infrastructure.outbox import (
    EVENT_SESSION_CANCELLED,
    EVENT_SESSION_PUBLISHED,
    enqueue_outbox,
)
from app.infrastructure.trainer_client import assert_trainer_approved


def create_venue(
    db: Session,
    *,
    name: str,
    address: str,
    city: str,
    capacity_hint: int | None,
    actor_id: UUID,
    correlation_id: str | None,
) -> Venue:
    row = Venue(
        name=name.strip(),
        address=address.strip(),
        city=city.strip(),
        capacity_hint=capacity_hint,
    )
    db.add(row)
    db.flush()
    write_audit(
        db,
        action="venue.created",
        resource_type="venue",
        resource_id=str(row.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"name": row.name},
    )
    db.commit()
    db.refresh(row)
    return row


def create_session(
    db: Session,
    *,
    trainer_user_id: UUID,
    authorization: str | None,
    venue_id: UUID,
    level_code: str,
    subject_id: UUID,
    chapter_id: UUID | None,
    title: str,
    starts_at: datetime,
    ends_at: datetime,
    capacity: int,
    price_xof: int,
    notes: str | None,
    correlation_id: str | None,
) -> TutoringSession:
    if ends_at <= starts_at:
        raise HTTPException(status_code=422, detail="Plage horaire invalide")
    if price_xof != int(price_xof) or price_xof < 0:
        raise HTTPException(status_code=422, detail="Prix XOF entier requis")

    trainer = assert_trainer_approved(
        trainer_user_id=trainer_user_id,
        authorization=authorization,
    )
    trainer_id = UUID(str(trainer["id"]))

    venue = db.get(Venue, venue_id)
    if venue is None:
        raise HTTPException(status_code=404, detail="Lieu introuvable")

    _assert_no_overlap(
        db,
        trainer_id=trainer_id,
        starts_at=starts_at,
        ends_at=ends_at,
        exclude_id=None,
    )

    row = TutoringSession(
        trainer_id=trainer_id,
        trainer_user_id=trainer_user_id,
        venue_id=venue_id,
        level_code=level_code.strip(),
        subject_id=subject_id,
        chapter_id=chapter_id,
        title=title.strip(),
        starts_at=starts_at,
        ends_at=ends_at,
        capacity=capacity,
        status=SessionStatus.DRAFT.value,
        price_xof=int(price_xof),
        price_status=PriceStatus.PROPOSED.value,
        notes=(notes.strip() if notes else None),
    )
    db.add(row)
    db.flush()
    write_audit(
        db,
        action="session.created",
        resource_type="session",
        resource_id=str(row.id),
        actor_id=trainer_user_id,
        correlation_id=correlation_id,
        metadata={"status": row.status, "price_xof": row.price_xof},
    )
    db.commit()
    db.refresh(row)
    return row


def submit_for_approval(
    db: Session,
    *,
    session_id: UUID,
    actor_id: UUID,
    roles: frozenset[str],
    correlation_id: str | None,
) -> TutoringSession:
    row = _get_owned_or_admin(db, session_id, actor_id, roles)
    return _transition(
        db,
        row=row,
        new_status=SessionStatus.PENDING_APPROVAL,
        actor_id=actor_id,
        correlation_id=correlation_id,
    )


def approve_price_and_publish(
    db: Session,
    *,
    session_id: UUID,
    actor_id: UUID,
    correlation_id: str | None,
) -> TutoringSession:
    """Admin : approuve le tarif et publie (RG tarif figé à la publication)."""
    row = db.get(TutoringSession, session_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    if row.status != SessionStatus.PENDING_APPROVAL.value:
        raise HTTPException(
            status_code=409,
            detail="La séance doit être PENDING_APPROVAL",
        )
    row.price_status = PriceStatus.APPROVED.value
    row.status = SessionStatus.PUBLISHED.value
    row.updated_at = datetime.now(UTC)
    enqueue_outbox(
        db,
        event_type=EVENT_SESSION_PUBLISHED,
        correlation_id=correlation_id,
        payload={
            "session_id": str(row.id),
            "trainer_id": str(row.trainer_id),
            "level_code": row.level_code,
            "subject_id": str(row.subject_id),
            "starts_at": row.starts_at.isoformat(),
            "ends_at": row.ends_at.isoformat(),
            "capacity": row.capacity,
            "price_xof": row.price_xof,
            "status": row.status,
        },
    )
    write_audit(
        db,
        action="session.price_approved_published",
        resource_type="session",
        resource_id=str(row.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"price_xof": row.price_xof, "price_status": row.price_status},
    )
    db.commit()
    db.refresh(row)
    return row


def cancel_session(
    db: Session,
    *,
    session_id: UUID,
    actor_id: UUID,
    roles: frozenset[str],
    correlation_id: str | None,
) -> TutoringSession:
    row = _get_owned_or_admin(db, session_id, actor_id, roles)
    current = SessionStatus(row.status)
    if SessionStatus.CANCELLED not in ALLOWED_SESSION_TRANSITIONS.get(current, frozenset()):
        raise HTTPException(status_code=409, detail="Annulation interdite")
    was_published = current in {SessionStatus.PUBLISHED, SessionStatus.FULL}
    row.status = SessionStatus.CANCELLED.value
    row.updated_at = datetime.now(UTC)
    if was_published:
        enqueue_outbox(
            db,
            event_type=EVENT_SESSION_CANCELLED,
            correlation_id=correlation_id,
            payload={
                "session_id": str(row.id),
                "trainer_id": str(row.trainer_id),
                "status": row.status,
            },
        )
    write_audit(
        db,
        action="session.cancelled",
        resource_type="session",
        resource_id=str(row.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"from": current.value},
    )
    db.commit()
    db.refresh(row)
    return row


def _transition(
    db: Session,
    *,
    row: TutoringSession,
    new_status: SessionStatus,
    actor_id: UUID,
    correlation_id: str | None,
) -> TutoringSession:
    current = SessionStatus(row.status)
    allowed = ALLOWED_SESSION_TRANSITIONS.get(current, frozenset())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Transition interdite : {current.value} → {new_status.value}",
        )
    row.status = new_status.value
    row.updated_at = datetime.now(UTC)
    write_audit(
        db,
        action="session.status_changed",
        resource_type="session",
        resource_id=str(row.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"from": current.value, "to": new_status.value},
    )
    db.commit()
    db.refresh(row)
    return row


def _get_owned_or_admin(
    db: Session,
    session_id: UUID,
    actor_id: UUID,
    roles: frozenset[str],
) -> TutoringSession:
    row = db.get(TutoringSession, session_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    if "ADMIN" not in roles and row.trainer_user_id != actor_id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return row


def _assert_no_overlap(
    db: Session,
    *,
    trainer_id: UUID,
    starts_at: datetime,
    ends_at: datetime,
    exclude_id: UUID | None,
) -> None:
    active = [
        SessionStatus.DRAFT.value,
        SessionStatus.PENDING_APPROVAL.value,
        SessionStatus.PUBLISHED.value,
        SessionStatus.FULL.value,
    ]
    stmt = select(TutoringSession).where(
        TutoringSession.trainer_id == trainer_id,
        TutoringSession.status.in_(active),
        and_(
            TutoringSession.starts_at < ends_at,
            TutoringSession.ends_at > starts_at,
        ),
    )
    if exclude_id is not None:
        stmt = stmt.where(TutoringSession.id != exclude_id)
    clash = db.scalars(stmt).first()
    if clash is not None:
        raise HTTPException(
            status_code=409,
            detail="Chevauchement d'horaire formateur interdit",
        )
