from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.levels import SUPPORTED_LEVELS_LABEL
from app.infrastructure.models import Chapter, Level, LevelSubject, Notion, Subject


def list_levels(db: Session) -> tuple[list[Level], str]:
    rows = db.scalars(
        select(Level)
        .where(Level.is_active.is_(True))
        .order_by(Level.sort_order.asc(), Level.code.asc())
    ).all()
    return list(rows), SUPPORTED_LEVELS_LABEL


def list_subjects(db: Session, *, level_code: str | None = None) -> list[Subject]:
    if level_code:
        level = db.get(Level, level_code)
        if level is None or not level.is_active:
            raise HTTPException(status_code=404, detail="Niveau inconnu")
        stmt = (
            select(Subject)
            .join(LevelSubject, LevelSubject.subject_id == Subject.id)
            .where(
                LevelSubject.level_code == level_code,
                Subject.is_active.is_(True),
            )
            .order_by(Subject.name.asc())
        )
        return list(db.scalars(stmt).all())
    return list(
        db.scalars(
            select(Subject).where(Subject.is_active.is_(True)).order_by(Subject.name.asc())
        ).all()
    )


def list_chapters(
    db: Session,
    *,
    subject_id: UUID,
    level_code: str,
) -> list[Chapter]:
    subject = db.get(Subject, subject_id)
    if subject is None or not subject.is_active:
        raise HTTPException(status_code=404, detail="Matière inconnue")
    level = db.get(Level, level_code)
    if level is None or not level.is_active:
        raise HTTPException(status_code=404, detail="Niveau inconnu")
    return list(
        db.scalars(
            select(Chapter)
            .where(
                Chapter.subject_id == subject_id,
                Chapter.level_code == level_code,
                Chapter.is_active.is_(True),
            )
            .order_by(Chapter.sort_order.asc(), Chapter.title.asc())
        ).all()
    )


def list_notions(db: Session, *, chapter_id: UUID) -> list[Notion]:
    chapter = db.get(Chapter, chapter_id)
    if chapter is None or not chapter.is_active:
        raise HTTPException(status_code=404, detail="Chapitre inconnu")
    return list(
        db.scalars(
            select(Notion)
            .where(Notion.chapter_id == chapter_id, Notion.is_active.is_(True))
            .order_by(Notion.sort_order.asc(), Notion.title.asc())
        ).all()
    )
