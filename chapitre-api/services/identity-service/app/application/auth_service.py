from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.application.audit import write_audit
from app.application.schemas import (
    InviteUserRequest,
    InviteUserResponse,
    LoginRequest,
    MeResponse,
    RegisterStudentRequest,
    SetPasswordRequest,
    StudentProfileOut,
    TokenResponse,
)
from app.config import get_settings
from app.domain.enums import Role, UserStatus
from app.infrastructure.models import (
    AccountInvitation,
    InvitationDeliverySecret,
    StudentProfile,
    User,
    UserRole,
)
from app.infrastructure.outbox import EVENT_USER_INVITED, enqueue_outbox, publish_pending_outbox
from app.infrastructure.security import (
    create_access_token,
    hash_invitation_token,
    hash_password,
    new_invitation_token,
    verify_password,
)
from app.infrastructure.token_crypto import encrypt_invitation_token


def _user_roles(user: User) -> list[str]:
    return [item.role for item in user.roles]


def _token_for(user: User) -> TokenResponse:
    roles = _user_roles(user)
    access_token, expires_in = create_access_token(user_id=user.id, roles=roles)
    return TokenResponse(
        access_token=access_token,
        expires_in=expires_in,
        user_id=user.id,
        roles=roles,
    )


def _load_user_by_email(db: Session, email: str) -> User | None:
    stmt = (
        select(User)
        .where(User.email == email.lower().strip())
        .options(selectinload(User.roles), selectinload(User.student_profile))
    )
    return db.scalars(stmt).first()


def _load_user_by_id(db: Session, user_id: UUID) -> User | None:
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.roles), selectinload(User.student_profile))
    )
    return db.scalars(stmt).first()


def register_student(db: Session, payload: RegisterStudentRequest) -> TokenResponse:
    email = str(payload.email).lower().strip()
    if _load_user_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cet e-mail",
        )

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        status=UserStatus.ACTIVE.value,
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    db.flush()
    db.add(UserRole(user_id=user.id, role=Role.STUDENT.value))
    db.add(
        StudentProfile(
            user_id=user.id,
            level=payload.level,
            city=payload.city.strip(),
            school_id=payload.school_id,
            school_name=payload.school_name,
            declared_guardian=payload.declared_guardian,
        )
    )
    write_audit(
        db,
        actor_id=user.id,
        action="user.registered",
        resource_type="user",
        resource_id=str(user.id),
        metadata={"role": Role.STUDENT.value},
    )
    db.commit()
    user = _load_user_by_id(db, user.id)
    assert user is not None
    return _token_for(user)


def login(db: Session, payload: LoginRequest) -> TokenResponse:
    email = str(payload.email).lower().strip()
    user = _load_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides",
        )
    if user.status == UserStatus.PENDING_PASSWORD.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Définissez votre mot de passe via l'invitation avant de vous connecter",
        )
    if user.status in {UserStatus.SUSPENDED.value, UserStatus.DISABLED.value}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte indisponible",
        )
    if not user.password_hash or not verify_password(user.password_hash, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides",
        )
    write_audit(
        db,
        actor_id=user.id,
        action="user.login",
        resource_type="user",
        resource_id=str(user.id),
    )
    db.commit()
    return _token_for(user)


def invite_user(
    db: Session,
    payload: InviteUserRequest,
    *,
    admin: User,
) -> InviteUserResponse:
    email = str(payload.email).lower().strip()
    if _load_user_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cet e-mail",
        )

    settings = get_settings()
    raw_token = new_invitation_token()
    expires_at = datetime.now(UTC) + timedelta(hours=settings.invitation_ttl_hours)

    user = User(
        email=email,
        password_hash=None,
        status=UserStatus.PENDING_PASSWORD.value,
        first_name=payload.first_name.strip() if payload.first_name else None,
        last_name=payload.last_name.strip() if payload.last_name else None,
    )
    db.add(user)
    db.flush()
    db.add(UserRole(user_id=user.id, role=payload.role.value))
    invitation = AccountInvitation(
        user_id=user.id,
        token_hash=hash_invitation_token(raw_token),
        invited_by_user_id=admin.id,
        expires_at=expires_at,
    )
    db.add(invitation)
    db.flush()
    # Jeton clair one-shot hors RabbitMQ (claim interne notification).
    db.add(
        InvitationDeliverySecret(
            invitation_id=invitation.id,
            token_ciphertext=encrypt_invitation_token(raw_token),
        )
    )
    write_audit(
        db,
        actor_id=admin.id,
        action="user.invited",
        resource_type="user",
        resource_id=str(user.id),
        metadata={"role": payload.role.value},
    )
    # Outbox dans la même transaction — payload SANS jeton (AGENTS : pas de secret dans RMQ).
    enqueue_outbox(
        db,
        event_type=EVENT_USER_INVITED,
        payload={
            "invitation_id": str(invitation.id),
            "user_id": str(user.id),
            "email": user.email,
            "role": payload.role.value,
            "expires_at": expires_at.isoformat(),
        },
        correlation_id=str(admin.id),
    )
    db.commit()
    db.refresh(invitation)
    # Best-effort après commit ; retry via worker outbox si broker down.
    try:
        publish_pending_outbox(limit=20)
    except Exception:
        pass
    return InviteUserResponse(
        invitation_id=invitation.id,
        user_id=user.id,
        email=user.email,
        role=payload.role.value,
        expires_at=expires_at,
        email_delivery="queued",
    )


def set_password_from_invitation(
    db: Session, payload: SetPasswordRequest
) -> TokenResponse:
    token_hash = hash_invitation_token(payload.token)
    invitation = db.scalars(
        select(AccountInvitation).where(AccountInvitation.token_hash == token_hash)
    ).first()
    if invitation is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation invalide",
        )
    if invitation.accepted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation déjà utilisée",
        )
    expires = invitation.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)
    if expires < datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation expirée",
        )

    user = _load_user_by_id(db, invitation.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation invalide",
        )

    user.password_hash = hash_password(payload.password)
    user.status = UserStatus.ACTIVE.value
    user.email_verified_at = datetime.now(UTC)
    invitation.accepted_at = datetime.now(UTC)
    write_audit(
        db,
        actor_id=user.id,
        action="user.password_set",
        resource_type="user",
        resource_id=str(user.id),
    )
    db.commit()
    user = _load_user_by_id(db, user.id)
    assert user is not None
    return _token_for(user)


def me_response(user: User) -> MeResponse:
    profile = None
    if user.student_profile is not None:
        profile = StudentProfileOut.model_validate(user.student_profile)
    return MeResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        status=user.status,
        roles=_user_roles(user),
        student_profile=profile,
    )


def get_user_for_auth(db: Session, user_id: UUID) -> User:
    user = _load_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalide",
        )
    if user.status != UserStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte indisponible",
        )
    return user
