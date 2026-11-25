"""Modèles notification — base chapitre_notification uniquement."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Uuid

from app.infrastructure.database import Base


class InboxEvent(Base):
    """Déduplication durable des event_id RabbitMQ (ACK après commit)."""

    __tablename__ = "inbox_events"
    __table_args__ = (UniqueConstraint("event_id", name="uq_inbox_events_event_id"),)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(128), nullable=False)
    processed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
