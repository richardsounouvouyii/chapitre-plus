"""Endpoints internes service-à-service (pas exposés via gateway publique)."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.infrastructure.database import get_db
from app.infrastructure.models import (
    AccountInvitation,
    InvitationDeliverySecret,
    User,
)
from app.infrastructure.token_crypto import decrypt_invitation_token

router = APIRouter(prefix="/internal", tags=["internal"])


class ClaimTokenResponse(BaseModel):
    invitation_id: UUID
    email: EmailStr
    role: str
    invitation_token: str
    expires_at: datetime


def require_service_key(
    x_service_key: str | None = Header(default=None, alias="X-Service-Key"),
) -> None:
    expected = get_settings().internal_service_key
    if not x_service_key or x_service_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clé de service invalide",
        )


@router.post(
    "/invitations/{invitation_id}/claim-token",
    response_model=ClaimTokenResponse,
)
def claim_invitation_token(
    invitation_id: UUID,
    db: Session = Depends(get_db),
    _: None = Depends(require_service_key),
) -> ClaimTokenResponse:
    """One-shot : notification récupère le jeton pour l'e-mail (jamais via RabbitMQ)."""
    secret = db.get(InvitationDeliverySecret, invitation_id)
    if secret is None:
        raise HTTPException(status_code=404, detail="Secret introuvable")
    if secret.claimed_at is not None:
        raise HTTPException(status_code=409, detail="Jeton déjà consommé")

    invitation = db.get(AccountInvitation, invitation_id)
    if invitation is None:
        raise HTTPException(status_code=404, detail="Invitation introuvable")

    user = db.scalars(
        select(User)
        .where(User.id == invitation.user_id)
        .options(selectinload(User.roles))
    ).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    role = next((r.role for r in user.roles), "")
    try:
        plain_token = decrypt_invitation_token(secret.token_ciphertext)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Secret invitation illisible",
        ) from exc
    secret.claimed_at = datetime.now(UTC)
    db.commit()

    return ClaimTokenResponse(
        invitation_id=invitation_id,
        email=user.email,
        role=role,
        invitation_token=plain_token,
        expires_at=invitation.expires_at,
    )
