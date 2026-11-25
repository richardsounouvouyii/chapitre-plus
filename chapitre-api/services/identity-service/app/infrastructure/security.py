"""Hash Argon2 + JWT courts + tokens d'invitation."""

from __future__ import annotations

import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from app.config import Settings, get_settings

_password_hasher = PasswordHasher()


def hash_password(plain: str) -> str:
    return _password_hasher.hash(plain)


def verify_password(password_hash: str, plain: str) -> bool:
    try:
        return _password_hasher.verify(password_hash, plain)
    except VerifyMismatchError:
        return False


def create_access_token(
    *,
    user_id: UUID,
    roles: list[str],
    settings: Settings | None = None,
) -> tuple[str, int]:
    """Retourne (jwt, expires_in_seconds). TTL court (défaut 15 min)."""
    cfg = settings or get_settings()
    ttl = max(1, cfg.jwt_access_ttl_minutes)
    now = datetime.now(UTC)
    expires = now + timedelta(minutes=ttl)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "roles": roles,
        "iss": cfg.jwt_issuer,
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
        "typ": "access",
    }
    token = jwt.encode(payload, cfg.jwt_secret, algorithm="HS256")
    return token, ttl * 60


def decode_access_token(token: str, settings: Settings | None = None) -> dict[str, Any]:
    cfg = settings or get_settings()
    return jwt.decode(
        token,
        cfg.jwt_secret,
        algorithms=["HS256"],
        issuer=cfg.jwt_issuer,
        options={"require": ["exp", "iat", "sub", "iss"]},
    )


def new_invitation_token() -> str:
    return secrets.token_urlsafe(32)


def hash_invitation_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
