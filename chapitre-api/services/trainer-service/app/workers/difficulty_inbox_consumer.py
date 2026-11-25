"""
Consomme difficulty.submitted.v1 → inbox + projection.

File : chapitre.trainer.difficulty.submitted
DLQ  : chapitre.trainer.difficulty.submitted.dlq
ACK uniquement après commit inbox réussi (auto_ack=False).

  python -m app.workers.difficulty_inbox_consumer
"""

from __future__ import annotations

import json
import logging

import pika

from app.config import get_settings
from app.infrastructure.database import SessionLocal
from app.infrastructure.inbox import EVENT_DIFFICULTY_SUBMITTED, process_difficulty_submitted

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trainer.difficulty_inbox")


def declare_topology(channel) -> None:  # noqa: ANN001
    settings = get_settings()
    channel.exchange_declare(
        exchange=settings.rabbitmq_exchange,
        exchange_type="topic",
        durable=True,
    )
    channel.queue_declare(queue=settings.difficulty_submitted_dlq, durable=True)
    channel.queue_declare(
        queue=settings.difficulty_submitted_queue,
        durable=True,
        arguments={
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": settings.difficulty_submitted_dlq,
        },
    )
    channel.queue_bind(
        queue=settings.difficulty_submitted_queue,
        exchange=settings.rabbitmq_exchange,
        routing_key=settings.difficulty_submitted_routing_key,
    )


def handle_delivery(body: bytes) -> None:
    envelope = json.loads(body.decode("utf-8"))
    event_type = envelope.get("event_type")
    if event_type and event_type != EVENT_DIFFICULTY_SUBMITTED:
        raise ValueError(f"event_type inattendu: {event_type}")
    db = SessionLocal()
    try:
        process_difficulty_submitted(db, envelope)
    finally:
        db.close()


def main() -> None:
    settings = get_settings()
    params = pika.URLParameters(settings.rabbitmq_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    declare_topology(channel)
    channel.basic_qos(prefetch_count=1)

    def _on_message(ch, method, _properties, body: bytes) -> None:  # noqa: ANN001
        try:
            handle_delivery(body)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            logger.exception(
                "difficulty_inbox_failed delivery_tag=%s → DLQ",
                method.delivery_tag,
            )
            # requeue=False → dead-letter vers DLQ
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(
        queue=settings.difficulty_submitted_queue,
        on_message_callback=_on_message,
        auto_ack=False,
    )
    logger.info(
        "consuming queue=%s routing_key=%s dlq=%s",
        settings.difficulty_submitted_queue,
        settings.difficulty_submitted_routing_key,
        settings.difficulty_submitted_dlq,
    )
    channel.start_consuming()


if __name__ == "__main__":
    main()
