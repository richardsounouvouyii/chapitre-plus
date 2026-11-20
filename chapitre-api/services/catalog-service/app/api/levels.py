"""Endpoints référentiel niveaux (préparation phase Identity+Catalog)."""

from fastapi import APIRouter

from app.domain.levels import SUPPORTED_LEVELS, SUPPORTED_LEVELS_LABEL

router = APIRouter(tags=["levels"])


@router.get("/levels")
def list_supported_levels() -> dict[str, object]:
    """Liste figée des classes MVP — sera enrichie (séries, matières) en phase 1."""
    return {
        "levels": list(SUPPORTED_LEVELS),
        "label": SUPPORTED_LEVELS_LABEL,
    }
