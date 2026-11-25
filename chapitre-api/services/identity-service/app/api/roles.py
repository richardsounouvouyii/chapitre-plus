"""Référentiel des rôles RBAC (lecture seule — étape schéma)."""

from fastapi import APIRouter

from app.domain.enums import Role

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("")
def list_roles() -> dict[str, list[str]]:
    """Liste les rôles techniques exposés au MVP (pas CENTER_MANAGER)."""
    return {"items": [role.value for role in Role]}
