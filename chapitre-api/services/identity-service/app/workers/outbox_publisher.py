"""
Relit l'outbox et publie vers RabbitMQ.

  python -m app.workers.outbox_publisher
"""

from __future__ import annotations

import logging
import time

from app.infrastructure.outbox import publish_pending_outbox

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("identity.outbox_worker")


def main() -> None:
    logger.info("outbox_publisher started")
    while True:
        n = publish_pending_outbox(limit=50)
        if n:
            logger.info("published=%s", n)
        time.sleep(2)


if __name__ == "__main__":
    main()
