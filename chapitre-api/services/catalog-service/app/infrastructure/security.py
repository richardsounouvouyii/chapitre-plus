"""Vérification JWT Identity (HS256) — pas d'accès à la base Identity."""

from __future__ import annotations

from typing import Any

import jwt

from app.config import Settings, get_settings


def decode_access_token(token: str, settings: Settings | None = None) -> dict[str, Any]:
    cfg = settings or get_settings()
    return jwt.decode(
        token,
        cfg.jwt_secret,
        algorithms=["HS256"],
        issuer=cfg.jwt_issuer,
        options={"require": ["exp", "iat", "sub", "iss"]},
    )
