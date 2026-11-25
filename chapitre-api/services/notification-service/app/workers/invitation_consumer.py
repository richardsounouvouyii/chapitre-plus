"""
Consomme identity.user.invited.v1 → claim token → e-mail.

  python -m app.workers.invitation_consumer
"""

from __future__ import annotations

import json
import logging

import pika

from app.application.invitation_handler import handle_user_invited
from app.config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notification.consumer")


def main() -> None:
    settings = get_settings()
    params = pika.URLParameters(settings.rabbitmq_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(
        exchange=settings.rabbitmq_exchange, exchange_type="topic", durable=True
    )
    channel.queue_declare(queue=settings.invitations_dlq, durable=True)
    channel.queue_declare(
        queue=settings.invitations_queue,
        durable=True,
        arguments={
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": settings.invitations_dlq,
        },
    )
    channel.queue_bind(
        queue=settings.invitations_queue,
        exchange=settings.rabbitmq_exchange,
        routing_key=settings.invitations_routing_key,
    )
    channel.basic_qos(prefetch_count=1)

    def _on_message(ch, method, _properties, body: bytes) -> None:  # noqa: ANN001
        try:
            envelope = json.loads(body.decode("utf-8"))
            handle_user_invited(envelope)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            logger.exception("invitation_consume_failed")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(
        queue=settings.invitations_queue,
        on_message_callback=_on_message,
        auto_ack=False,
    )
    logger.info("consuming queue=%s", settings.invitations_queue)
    channel.start_consuming()


if __name__ == "__main__":
    main()
