from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import AuthPrincipal, require_admin, require_trainer
from app.application import commands, queries
from app.application.schemas import (
    AvailabilityCreate,
    AvailabilityOut,
    CompatibleDifficultiesResponse,
    CompetencyCreate,
    CompetencyOut,
    DifficultyProjectionOut,
    ProfileCreate,
    TrainerListResponse,
    TrainerOut,
)
from app.domain.enums import TrainerStatus
from app.infrastructure.database import get_db

router = APIRouter(prefix="/trainers", tags=["trainers"])


@router.post("/me/profile", response_model=TrainerOut, status_code=status.HTTP_201_CREATED)
def create_my_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> TrainerOut:
    row = commands.create_profile(
        db,
        user_id=principal.user_id,
        bio=payload.bio,
        correlation_id=principal.correlation_id,
    )
    return TrainerOut.model_validate(row)


@router.get("/me", response_model=TrainerOut)
def get_my_profile(
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> TrainerOut:
    return TrainerOut.model_validate(queries.get_me(db, user_id=principal.user_id))


@router.post(
    "/me/competencies",
    response_model=CompetencyOut,
    status_code=status.HTTP_201_CREATED,
)
def add_competency(
    payload: CompetencyCreate,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> CompetencyOut:
    row = commands.add_competency(
        db,
        user_id=principal.user_id,
        level_code=payload.level_code,
        subject_id=payload.subject_id,
        correlation_id=principal.correlation_id,
    )
    return CompetencyOut.model_validate(row)


@router.delete("/me/competencies/{competency_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_competency(
    competency_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> None:
    commands.delete_competency(db, user_id=principal.user_id, competency_id=competency_id)


@router.post(
    "/me/availabilities",
    response_model=AvailabilityOut,
    status_code=status.HTTP_201_CREATED,
)
def add_availability(
    payload: AvailabilityCreate,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> AvailabilityOut:
    row = commands.add_availability(
        db,
        user_id=principal.user_id,
        weekday=payload.weekday,
        start_time=payload.start_time,
        end_time=payload.end_time,
        timezone=payload.timezone,
        correlation_id=principal.correlation_id,
    )
    return AvailabilityOut.model_validate(row)


@router.delete(
    "/me/availabilities/{availability_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_availability(
    availability_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> None:
    commands.delete_availability(
        db, user_id=principal.user_id, availability_id=availability_id
    )


@router.get("/compatible-difficulties", response_model=CompatibleDifficultiesResponse)
def compatible_difficulties(
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> CompatibleDifficultiesResponse:
    rows = queries.compatible_difficulties(db, user_id=principal.user_id)
    return CompatibleDifficultiesResponse(
        items=[DifficultyProjectionOut.model_validate(r) for r in rows]
    )


@router.get("", response_model=TrainerListResponse)
def list_trainers(
    db: Session = Depends(get_db),
    _: AuthPrincipal = Depends(require_admin),
) -> TrainerListResponse:
    rows = queries.list_trainers(db)
    return TrainerListResponse(items=[TrainerOut.model_validate(r) for r in rows])


@router.post("/{trainer_id}/approve", response_model=TrainerOut)
def approve_trainer(
    trainer_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_admin),
) -> TrainerOut:
    row = commands.transition_status(
        db,
        trainer_id=trainer_id,
        new_status=TrainerStatus.APPROVED,
        actor_id=principal.user_id,
        correlation_id=principal.correlation_id,
    )
    return TrainerOut.model_validate(row)


@router.post("/{trainer_id}/reject", response_model=TrainerOut)
def reject_trainer(
    trainer_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_admin),
) -> TrainerOut:
    row = commands.transition_status(
        db,
        trainer_id=trainer_id,
        new_status=TrainerStatus.REJECTED,
        actor_id=principal.user_id,
        correlation_id=principal.correlation_id,
    )
    return TrainerOut.model_validate(row)


@router.post("/{trainer_id}/suspend", response_model=TrainerOut)
def suspend_trainer(
    trainer_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_admin),
) -> TrainerOut:
    row = commands.transition_status(
        db,
        trainer_id=trainer_id,
        new_status=TrainerStatus.SUSPENDED,
        actor_id=principal.user_id,
        correlation_id=principal.correlation_id,
    )
    return TrainerOut.model_validate(row)
