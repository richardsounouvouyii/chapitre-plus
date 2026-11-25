from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field

from app.infrastructure.email_adapter import InvitationEmail, list_delivered, send_invitation_email

router = APIRouter(prefix="/internal/invitations", tags=["internal-invitations"])


class InvitationNotifyRequest(BaseModel):
    invitation_id: str
    email: EmailStr
    role: str = Field(min_length=1, max_length=32)
    invitation_token: str = Field(min_length=20, max_length=200)
    expires_at: datetime


class InvitationNotifyResponse(BaseModel):
    status: str
    invitation_id: str


@router.post("", response_model=InvitationNotifyResponse, status_code=202)
def notify_invitation(payload: InvitationNotifyRequest) -> InvitationNotifyResponse:
    """Reçoit le jeton depuis Identity et « envoie » l'e-mail (adaptateur log)."""
    send_invitation_email(
        InvitationEmail(
            invitation_id=payload.invitation_id,
            to_email=str(payload.email).lower(),
            role=payload.role,
            invitation_token=payload.invitation_token,
            expires_at=payload.expires_at,
        )
    )
    return InvitationNotifyResponse(status="sent", invitation_id=payload.invitation_id)


@router.get("/_test/last")
def last_delivered_for_tests(email: str) -> dict:
    """
    Lecture test/dev uniquement — permet aux tests Identity de récupérer le jeton
    sans l'exposer sur POST /auth/invitations.
    """
    matches = [item for item in list_delivered() if item.to_email == email.lower()]
    if not matches:
        return {"found": False}
    last = matches[-1]
    return {
        "found": True,
        "invitation_id": last.invitation_id,
        "invitation_token": last.invitation_token,
        "role": last.role,
        "status": last.status,
    }
