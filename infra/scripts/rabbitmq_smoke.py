"""Test phase 0 : publie et consomme un message sur l'exchange topic chapitre.events.v1."""
from __future__ import annotations

import json
import sys
import time
import uuid

import pika

EXCHANGE = "chapitre.events.v1"
ROUTING_KEY = "phase0.smoke.v1"
QUEUE = "chapitre.phase0.smoke"
URL = "amqp://chapitre:chapitre_dev_change_me@localhost:5673/"


def main() -> int:
    params = pika.URLParameters(URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    channel.queue_declare(queue=QUEUE, durable=True)
    channel.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key=ROUTING_KEY)

    event_id = str(uuid.uuid4())
    payload = {
        "event_id": event_id,
        "event_type": ROUTING_KEY,
        "schema_version": "1",
        "occurred_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "producer": "phase0-smoke",
        "correlation_id": str(uuid.uuid4()),
        "payload": {"ok": True},
    }
    body = json.dumps(payload).encode("utf-8")

    channel.basic_publish(
        exchange=EXCHANGE,
        routing_key=ROUTING_KEY,
        body=body,
        properties=pika.BasicProperties(content_type="application/json", delivery_mode=2),
    )
    print(f"PUBLISHED {event_id}")

    method, _properties, received = channel.basic_get(queue=QUEUE, auto_ack=True)
    connection.close()

    if method is None:
        print("FAILED: aucun message consommé", file=sys.stderr)
        return 1

    data = json.loads(received.decode("utf-8"))
    if data.get("event_id") != event_id:
        print(f"FAILED: event_id mismatch {data}", file=sys.stderr)
        return 1

    print(f"CONSUMED {data['event_id']}")
    print("OK RabbitMQ smoke test")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
