"""Outbox transactionnelle Identity → RabbitMQ (publisher confirms)."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import UTC, datetime
from typing import Any

import pika
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.infrastructure.database import SessionLocal
from app.infrastructure.models import OutboxEvent

logger = logging.getLogger("identity.outbox")

EVENT_USER_INVITED = "identity.user.invited.v1"


def enqueue_outbox(
    db: Session,
    *,
    event_type: str,
    payload: dict[str, Any],
    correlation_id: str | None = None,
) -> OutboxEvent:
    row = OutboxEvent(
        event_id=uuid.uuid4(),
        event_type=event_type,
        routing_key=event_type,
        schema_version="1",
        producer="identity-service",
        correlation_id=correlation_id or str(uuid.uuid4()),
        payload=payload,
        occurred_at=datetime.now(UTC),
    )
    db.add(row)
    return row


def _envelope(row: OutboxEvent) -> dict[str, Any]:
    return {
        "event_id": str(row.event_id),
        "event_type": row.event_type,
        "schema_version": row.schema_version,
        "occurred_at": row.occurred_at.astimezone(UTC).isoformat().replace("+00:00", "Z"),
        "producer": row.producer,
        "correlation_id": row.correlation_id or str(uuid.uuid4()),
        "payload": row.payload,
    }


def publish_pending_outbox(*, limit: int = 50) -> int:
    """Publie les événements non envoyés ; marque published_at seulement après confirm."""
    import os

    if os.environ.get("IDENTITY_SKIP_OUTBOX_PUBLISH", "").lower() in {"1", "true", "yes"}:
        return 0
    settings = get_settings()
    db = SessionLocal()
    published = 0
    try:
        rows = db.scalars(
            select(OutboxEvent)
            .where(OutboxEvent.published_at.is_(None))
            .order_by(OutboxEvent.created_at.asc())
            .limit(limit)
        ).all()
        if not rows:
            return 0

        params = pika.URLParameters(settings.rabbitmq_url)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.exchange_declare(
            exchange=settings.rabbitmq_exchange,
            exchange_type="topic",
            durable=True,
        )
        channel.confirm_delivery()

        for row in rows:
            body = json.dumps(_envelope(row), default=str).encode("utf-8")
            try:
                channel.basic_publish(
                    exchange=settings.rabbitmq_exchange,
                    routing_key=row.routing_key,
                    body=body,
                    properties=pika.BasicProperties(
                        content_type="application/json",
                        delivery_mode=2,
                        message_id=str(row.event_id),
                    ),
                    mandatory=False,
                )
            except Exception:
                logger.exception("outbox_publish_failed event_id=%s", row.event_id)
                break
            row.published_at = datetime.now(UTC)
            published += 1
            db.commit()

        connection.close()
        return published
    except Exception:
        logger.exception("outbox_broker_unavailable")
        db.rollback()
        return published
    finally:
        db.close()
