"""Inbox Postgres — remplace le set mémoire."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.infrastructure.database import SessionLocal
from app.infrastructure.models import InboxEvent


def already_processed(event_id: str, db: Session | None = None) -> bool:
    own = db is None
    session = db or SessionLocal()
    try:
        row = session.scalars(
            select(InboxEvent).where(InboxEvent.event_id == event_id)
        ).first()
        return row is not None
    finally:
        if own:
            session.close()


def mark_processed(
    event_id: str,
    *,
    event_type: str,
    db: Session | None = None,
) -> bool:
    """
    Insère l'event_id. Retourne True si nouvellement marqué, False si déjà présent.
    """
    own = db is None
    session = db or SessionLocal()
    try:
        session.add(InboxEvent(event_id=event_id, event_type=event_type))
        session.commit()
        return True
    except IntegrityError:
        session.rollback()
        return False
    finally:
        if own:
            session.close()


def reset_inbox_for_tests() -> None:
    """Vide la table inbox (tests d'intégration / SQLite mémoire)."""
    session = SessionLocal()
    try:
        session.query(InboxEvent).delete()
        session.commit()
    finally:
        session.close()
