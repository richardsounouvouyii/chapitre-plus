from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

import jwt
from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.infrastructure.security import decode_access_token

_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True, slots=True)
class AuthPrincipal:
    user_id: UUID
    roles: frozenset[str]
    correlation_id: str | None = None
    raw_authorization: str | None = None


def get_correlation_id(
    x_correlation_id: str | None = Header(default=None, alias="X-Correlation-ID"),
) -> str | None:
    if x_correlation_id is None:
        return None
    value = x_correlation_id.strip()
    return value[:64] if value else None


def get_current_principal(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    correlation_id: str | None = Depends(get_correlation_id),
) -> AuthPrincipal:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise",
        )
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(str(payload["sub"]))
        roles_raw = payload.get("roles") or []
        if not isinstance(roles_raw, list):
            raise ValueError("roles invalides")
        roles = frozenset(str(r) for r in roles_raw)
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton invalide ou expiré",
        ) from None
    raw = request.headers.get("Authorization")
    return AuthPrincipal(
        user_id=user_id,
        roles=roles,
        correlation_id=correlation_id,
        raw_authorization=raw,
    )


def require_trainer(principal: AuthPrincipal = Depends(get_current_principal)) -> AuthPrincipal:
    if "TRAINER" not in principal.roles:
        raise HTTPException(status_code=403, detail="Réservé au formateur")
    return principal


def require_admin(principal: AuthPrincipal = Depends(get_current_principal)) -> AuthPrincipal:
    if "ADMIN" not in principal.roles:
        raise HTTPException(status_code=403, detail="Réservé à l'administrateur")
    return principal
