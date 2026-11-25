"""Vérifie que le formateur est APPROVED (trainer-service)."""

from __future__ import annotations

from uuid import UUID

import httpx
from fastapi import HTTPException, status

from app.config import get_settings


def assert_trainer_approved(
    *,
    trainer_user_id: UUID,
    authorization: str | None,
    client: httpx.Client | None = None,
) -> dict:
    """
    GET /trainers/me avec le JWT formateur — statut doit être APPROVED.
    (Pas d'accès à la base trainer.)
    """
    settings = get_settings()
    base = settings.trainer_service_url.rstrip("/")
    owns = client is None
    http = client or httpx.Client(timeout=5.0)
    headers = {}
    if authorization:
        headers["Authorization"] = authorization
    try:
        try:
            resp = http.get(f"{base}/trainers/me", headers=headers)
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="trainer-service indisponible",
            ) from exc
        if resp.status_code == 404:
            raise HTTPException(status_code=403, detail="Profil formateur introuvable")
        if resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Formateur non autorisé",
            )
        body = resp.json()
        if body.get("status") != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Formateur non approuvé — offre payante interdite",
            )
        if str(body.get("user_id")) != str(trainer_user_id):
            raise HTTPException(status_code=403, detail="Identité formateur incohérente")
        return body
    finally:
        if owns:
            http.close()
