"""Validation synchrone des refs Catalog (niveau / matière [/ chapitre]).

Appel service-à-service vers catalog-service (même cible que derrière la gateway).
"""

from __future__ import annotations

from uuid import UUID

import httpx
from fastapi import HTTPException, status

from app.config import get_settings


def assert_catalog_refs(
    *,
    level_code: str,
    subject_id: UUID,
    chapter_id: UUID | None = None,
    client: httpx.Client | None = None,
) -> None:
    settings = get_settings()
    base = settings.catalog_service_url.rstrip("/")
    owns_client = client is None
    http = client or httpx.Client(timeout=settings.catalog_timeout_seconds)
    try:
        try:
            levels_resp = http.get(f"{base}/levels")
            levels_resp.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="catalog-service indisponible",
            ) from exc

        levels = levels_resp.json().get("levels") or []
        codes = {item.get("code") for item in levels}
        if level_code not in codes:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Niveau inconnu dans le catalogue",
            )

        try:
            subjects_resp = http.get(
                f"{base}/subjects",
                params={"level": level_code},
            )
            subjects_resp.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="catalog-service indisponible",
            ) from exc

        subjects = subjects_resp.json().get("items") or []
        subject_ids = {str(item.get("id")) for item in subjects}
        if str(subject_id) not in subject_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Matière inconnue pour ce niveau",
            )

        if chapter_id is None:
            return

        try:
            chapters_resp = http.get(
                f"{base}/subjects/{subject_id}/chapters",
                params={"level": level_code},
            )
            chapters_resp.raise_for_status()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="catalog-service indisponible",
            ) from exc

        chapters = chapters_resp.json().get("items") or []
        chapter_ids = {str(item.get("id")) for item in chapters}
        if str(chapter_id) not in chapter_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Chapitre inconnu pour cette matière et ce niveau",
            )
    finally:
        if owns_client:
            http.close()
