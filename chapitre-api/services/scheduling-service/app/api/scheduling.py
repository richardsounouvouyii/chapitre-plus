from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import AuthPrincipal, get_current_principal, require_admin, require_trainer
from app.application import commands, queries
from app.application.schemas import (
    SessionCreate,
    SessionListResponse,
    SessionOut,
    VenueCreate,
    VenueListResponse,
    VenueOut,
)
from app.infrastructure.database import get_db

router = APIRouter(tags=["scheduling"])


@router.post("/venues", response_model=VenueOut, status_code=status.HTTP_201_CREATED)
def create_venue(
    payload: VenueCreate,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_admin),
) -> VenueOut:
    row = commands.create_venue(
        db,
        name=payload.name,
        address=payload.address,
        city=payload.city,
        capacity_hint=payload.capacity_hint,
        actor_id=principal.user_id,
        correlation_id=principal.correlation_id,
    )
    return VenueOut.model_validate(row)


@router.get("/venues", response_model=VenueListResponse)
def list_venues(
    db: Session = Depends(get_db),
    _: AuthPrincipal = Depends(get_current_principal),
) -> VenueListResponse:
    rows = queries.list_venues(db)
    return VenueListResponse(items=[VenueOut.model_validate(r) for r in rows])


@router.post("/sessions", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> SessionOut:
    row = commands.create_session(
        db,
        trainer_user_id=principal.user_id,
        authorization=principal.raw_authorization,
        venue_id=payload.venue_id,
        level_code=payload.level_code,
        subject_id=payload.subject_id,
        chapter_id=payload.chapter_id,
        title=payload.title,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        capacity=payload.capacity,
        price_xof=payload.price_xof,
        notes=payload.notes,
        correlation_id=principal.correlation_id,
    )
    return SessionOut.model_validate(row)


@router.get("/sessions", response_model=SessionListResponse)
def list_sessions(
    published_only: bool = Query(default=False),
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(get_current_principal),
) -> SessionListResponse:
    rows = queries.list_sessions(
        db,
        actor_id=principal.user_id,
        roles=principal.roles,
        published_only=published_only,
    )
    return SessionListResponse(items=[SessionOut.model_validate(r) for r in rows])


@router.get("/sessions/{session_id}", response_model=SessionOut)
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(get_current_principal),
) -> SessionOut:
    row = queries.get_session(
        db,
        session_id=session_id,
        actor_id=principal.user_id,
        roles=principal.roles,
    )
    return SessionOut.model_validate(row)


@router.post("/sessions/{session_id}/submit", response_model=SessionOut)
def submit_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_trainer),
) -> SessionOut:
    row = commands.submit_for_approval(
        db,
        session_id=session_id,
        actor_id=principal.user_id,
        roles=principal.roles,
        correlation_id=principal.correlation_id,
    )
    return SessionOut.model_validate(row)


@router.post("/sessions/{session_id}/approve-price", response_model=SessionOut)
def approve_price(
    session_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(require_admin),
) -> SessionOut:
    row = commands.approve_price_and_publish(
        db,
        session_id=session_id,
        actor_id=principal.user_id,
        correlation_id=principal.correlation_id,
    )
    return SessionOut.model_validate(row)


@router.post("/sessions/{session_id}/cancel", response_model=SessionOut)
def cancel_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    principal: AuthPrincipal = Depends(get_current_principal),
) -> SessionOut:
    if "TRAINER" not in principal.roles and "ADMIN" not in principal.roles:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Réservé formateur ou admin")
    row = commands.cancel_session(
        db,
        session_id=session_id,
        actor_id=principal.user_id,
        roles=principal.roles,
        correlation_id=principal.correlation_id,
    )
    return SessionOut.model_validate(row)
