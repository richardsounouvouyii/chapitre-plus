from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.enums import SessionStatus
from app.infrastructure.models import TutoringSession, Venue


def list_venues(db: Session) -> list[Venue]:
    return list(db.scalars(select(Venue).order_by(Venue.name.asc())).all())


def get_session(
    db: Session,
    *,
    session_id: UUID,
    actor_id: UUID,
    roles: frozenset[str],
) -> TutoringSession:
    row = db.get(TutoringSession, session_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    if "ADMIN" in roles:
        return row
    if row.status == SessionStatus.PUBLISHED.value or row.status == SessionStatus.FULL.value:
        return row
    if row.trainer_user_id == actor_id:
        return row
    raise HTTPException(status_code=403, detail="Accès refusé")


def list_sessions(
    db: Session,
    *,
    actor_id: UUID,
    roles: frozenset[str],
    published_only: bool = False,
) -> list[TutoringSession]:
    stmt = select(TutoringSession).order_by(TutoringSession.starts_at.asc())
    if published_only or "STUDENT" in roles and "ADMIN" not in roles and "TRAINER" not in roles:
        stmt = stmt.where(
            TutoringSession.status.in_(
                [SessionStatus.PUBLISHED.value, SessionStatus.FULL.value]
            )
        )
    elif "ADMIN" in roles:
        pass
    elif "TRAINER" in roles:
        stmt = stmt.where(TutoringSession.trainer_user_id == actor_id)
    else:
        stmt = stmt.where(
            TutoringSession.status.in_(
                [SessionStatus.PUBLISHED.value, SessionStatus.FULL.value]
            )
        )
    return list(db.scalars(stmt).all())
