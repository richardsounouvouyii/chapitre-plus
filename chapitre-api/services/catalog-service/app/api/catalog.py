from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.application import queries
from app.application.schemas import (
    ChapterOut,
    ChaptersResponse,
    LevelOut,
    LevelsResponse,
    NotionOut,
    NotionsResponse,
    SubjectOut,
    SubjectsResponse,
)
from app.infrastructure.database import get_db

router = APIRouter(tags=["catalog"])


@router.get("/levels", response_model=LevelsResponse)
def get_levels(db: Session = Depends(get_db)) -> LevelsResponse:
    rows, label = queries.list_levels(db)
    return LevelsResponse(levels=[LevelOut.model_validate(r) for r in rows], label=label)


@router.get("/subjects", response_model=SubjectsResponse)
def get_subjects(
    level: str | None = Query(default=None, description="Filtrer par code niveau (ex. 3e)"),
    db: Session = Depends(get_db),
) -> SubjectsResponse:
    rows = queries.list_subjects(db, level_code=level)
    return SubjectsResponse(items=[SubjectOut.model_validate(r) for r in rows])


@router.get("/subjects/{subject_id}/chapters", response_model=ChaptersResponse)
def get_chapters(
    subject_id: UUID,
    level: str = Query(..., description="Code niveau obligatoire"),
    db: Session = Depends(get_db),
) -> ChaptersResponse:
    rows = queries.list_chapters(db, subject_id=subject_id, level_code=level)
    return ChaptersResponse(items=[ChapterOut.model_validate(r) for r in rows])


@router.get("/chapters/{chapter_id}/notions", response_model=NotionsResponse)
def get_notions(chapter_id: UUID, db: Session = Depends(get_db)) -> NotionsResponse:
    rows = queries.list_notions(db, chapter_id=chapter_id)
    return NotionsResponse(items=[NotionOut.model_validate(r) for r in rows])
