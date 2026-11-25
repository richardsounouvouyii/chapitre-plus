from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application import auth_service
from app.application.schemas import (
    InviteUserRequest,
    InviteUserResponse,
    LoginRequest,
    MeResponse,
    RegisterStudentRequest,
    SetPasswordRequest,
    TokenResponse,
)
from app.api.deps import get_current_user, require_admin
from app.infrastructure.database import get_db
from app.infrastructure.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register_student(
    payload: RegisterStudentRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Inscription self-service élève uniquement."""
    return auth_service.register_student(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return auth_service.login(db, payload)


@router.post("/invitations", response_model=InviteUserResponse, status_code=201)
def invite_user(
    payload: InviteUserRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> InviteUserResponse:
    """Admin crée un compte TRAINER / PARENT / ADMIN en PENDING_PASSWORD."""
    return auth_service.invite_user(db, payload, admin=admin)


@router.post("/set-password", response_model=TokenResponse)
def set_password(
    payload: SetPasswordRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Première connexion via jeton d'invitation."""
    return auth_service.set_password_from_invitation(db, payload)


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)) -> MeResponse:
    return auth_service.me_response(user)
