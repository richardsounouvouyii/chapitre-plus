from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import AuthPrincipal, get_current_principal, require_student_or_admin
from app.application import commands, queries
from app.application.schemas import (
    DifficultyCreate,
    DifficultyListResponse,
    DifficultyOut,
    DifficultyStatusUpdate,
)
from app.infrastructure.database import get_db

router = APIRouter(prefix="/difficulties", tags=["difficulties"])


@router.post("", response_model=DifficultyOut, status_code=status.HTTP_201_CREATED)
def create_difficulty(
    payload: DifficultyCreate,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(get_current_principal),
) -> DifficultyOut:
    if "STUDENT" not in principal.roles:
        raise HTTPException(
            status_code=403,
            detail="Seul un élève peut déclarer une difficulté",
        )
    row = commands.create_difficulty(
        db,
        student_id=principal.user_id,
        level_code=payload.level_code,
        subject_id=payload.subject_id,
        chapter_id=payload.chapter_id,
        notion=payload.notion,
        description=payload.description,
        preferences=payload.preferences,
        correlation_id=principal.correlation_id,
    )
    return DifficultyOut.model_validate(row)


@router.get("", response_model=DifficultyListResponse)
def list_difficulties(
    student_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_student_or_admin),
) -> DifficultyListResponse:
    rows = queries.list_difficulties(
        db,
        actor_id=principal.user_id,
        roles=principal.roles,
        student_id=student_id,
    )
    return DifficultyListResponse(items=[DifficultyOut.model_validate(r) for r in rows])


@router.get("/{difficulty_id}", response_model=DifficultyOut)
def get_difficulty(
    difficulty_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(get_current_principal),
) -> DifficultyOut:
    row = queries.get_difficulty(
        db,
        difficulty_id=difficulty_id,
        actor_id=principal.user_id,
        roles=principal.roles,
    )
    return DifficultyOut.model_validate(row)


@router.patch("/{difficulty_id}/status", response_model=DifficultyOut)
def patch_status(
    difficulty_id: UUID,
    payload: DifficultyStatusUpdate,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(get_current_principal),
) -> DifficultyOut:
    row = commands.update_status(
        db,
        difficulty_id=difficulty_id,
        new_status_raw=payload.status,
        actor_id=principal.user_id,
        roles=principal.roles,
        correlation_id=principal.correlation_id,
    )
    return DifficultyOut.model_validate(row)
