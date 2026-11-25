"""Adaptateur e-mail — log en dev ; vrai SMTP/provider plus tard."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger("notification.email")


@dataclass(frozen=True)
class InvitationEmail:
    invitation_id: str
    to_email: str
    role: str
    invitation_token: str
    expires_at: datetime
    set_password_path: str = "/connexion"  # front ; lien complet plus tard


@dataclass
class DeliveredInvitation:
    invitation_id: str
    to_email: str
    role: str
    invitation_token: str
    expires_at: datetime
    status: str = "sent"


# Outbox mémoire process — remplacée par table + worker phase Notification.
_DELIVERED: list[DeliveredInvitation] = []


def reset_delivered_for_tests() -> None:
    _DELIVERED.clear()


def list_delivered() -> list[DeliveredInvitation]:
    return list(_DELIVERED)


def send_invitation_email(payload: InvitationEmail) -> DeliveredInvitation:
    """« Envoie » l'invitation (log) — le token ne remonte plus via Identity API."""
    logger.info(
        "invitation_email_sent invitation_id=%s to=%s role=%s expires_at=%s",
        payload.invitation_id,
        payload.to_email,
        payload.role,
        payload.expires_at.isoformat(),
    )
    delivered = DeliveredInvitation(
        invitation_id=payload.invitation_id,
        to_email=payload.to_email,
        role=payload.role,
        invitation_token=payload.invitation_token,
        expires_at=payload.expires_at,
        status="sent",
    )
    _DELIVERED.append(delivered)
    return delivered
