"""Traite identity.user.invited.v1 : claim token Identity + e-mail."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

import httpx

from app.config import get_settings
from app.infrastructure.email_adapter import InvitationEmail, send_invitation_email
from app.infrastructure.inbox import already_processed, mark_processed

logger = logging.getLogger("notification.invitation")


def _parse_dt(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    text = str(value).replace("Z", "+00:00")
    return datetime.fromisoformat(text)


def handle_user_invited(envelope: dict[str, Any]) -> None:
    event_id = str(envelope.get("event_id", ""))
    event_type = str(envelope.get("event_type", "identity.user.invited.v1"))
    if not event_id:
        raise ValueError("event_id manquant")
    if already_processed(event_id):
        logger.info("inbox_skip event_id=%s", event_id)
        return

    payload = envelope.get("payload") or {}
    invitation_id = payload.get("invitation_id")
    if not invitation_id:
        raise ValueError("invitation_id manquant")

    settings = get_settings()
    url = (
        f"{settings.identity_service_url.rstrip('/')}"
        f"/internal/invitations/{invitation_id}/claim-token"
    )
    response = httpx.post(
        url,
        headers={"X-Service-Key": settings.identity_internal_service_key},
        timeout=10.0,
    )
    if response.status_code == 409:
        mark_processed(event_id, event_type=event_type)
        logger.info("token_already_claimed invitation_id=%s", invitation_id)
        return
    response.raise_for_status()
    data = response.json()

    send_invitation_email(
        InvitationEmail(
            invitation_id=str(data["invitation_id"]),
            to_email=str(data["email"]).lower(),
            role=str(data["role"]),
            invitation_token=str(data["invitation_token"]),
            expires_at=_parse_dt(data["expires_at"]),
        )
    )
    mark_processed(event_id, event_type=event_type)
    logger.info("invitation_email_handled event_id=%s", event_id)
