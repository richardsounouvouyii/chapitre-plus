"""Client HTTP vers notification-service (envoi invitation)."""

from __future__ import annotations

from datetime import datetime
from typing import Protocol

import httpx

from app.config import get_settings


class NotificationClient(Protocol):
    def send_invitation(
        self,
        *,
        invitation_id: str,
        email: str,
        role: str,
        invitation_token: str,
        expires_at: datetime,
    ) -> None: ...


class HttpNotificationClient:
    def send_invitation(
        self,
        *,
        invitation_id: str,
        email: str,
        role: str,
        invitation_token: str,
        expires_at: datetime,
    ) -> None:
        settings = get_settings()
        url = f"{settings.notification_service_url.rstrip('/')}/internal/invitations"
        response = httpx.post(
            url,
            json={
                "invitation_id": invitation_id,
                "email": email,
                "role": role,
                "invitation_token": invitation_token,
                "expires_at": expires_at.isoformat(),
            },
            timeout=5.0,
        )
        response.raise_for_status()


class RecordingNotificationClient:
    """Client test : capture le jeton sans HTTP."""

    def __init__(self) -> None:
        self.sent: list[dict] = []

    def send_invitation(
        self,
        *,
        invitation_id: str,
        email: str,
        role: str,
        invitation_token: str,
        expires_at: datetime,
    ) -> None:
        self.sent.append(
            {
                "invitation_id": invitation_id,
                "email": email,
                "role": role,
                "invitation_token": invitation_token,
                "expires_at": expires_at,
            }
        )


_client: NotificationClient | None = None


def get_notification_client() -> NotificationClient:
    global _client
    if _client is None:
        _client = HttpNotificationClient()
    return _client


def set_notification_client(client: NotificationClient | None) -> None:
    global _client
    _client = client
