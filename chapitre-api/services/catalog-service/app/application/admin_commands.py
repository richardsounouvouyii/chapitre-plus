from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.audit import write_audit
from app.application.seed_data import slugify
from app.infrastructure.models import Chapter, Level, LevelSubject, Notion, Subject


def create_subject(
    db: Session,
    *,
    name: str,
    actor_id: UUID,
    correlation_id: str | None,
    level_codes: list[str] | None = None,
) -> Subject:
    cleaned = name.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail="Nom de matière requis")
    existing = db.scalars(select(Subject).where(Subject.name == cleaned)).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Matière déjà existante")
    subject = Subject(name=cleaned, slug=slugify(cleaned), is_active=True)
    db.add(subject)
    db.flush()
    for code in level_codes or []:
        _ensure_level(db, code)
        db.add(LevelSubject(level_code=code, subject_id=subject.id))
    write_audit(
        db,
        action="subject.created",
        resource_type="subject",
        resource_id=str(subject.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"name": cleaned, "level_codes": level_codes or []},
    )
    db.commit()
    db.refresh(subject)
    return subject


def update_subject(
    db: Session,
    *,
    subject_id: UUID,
    actor_id: UUID,
    correlation_id: str | None,
    name: str | None = None,
    is_active: bool | None = None,
) -> Subject:
    subject = db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Matière inconnue")
    changes: dict = {}
    if name is not None:
        cleaned = name.strip()
        if not cleaned:
            raise HTTPException(status_code=422, detail="Nom de matière requis")
        clash = db.scalars(
            select(Subject).where(Subject.name == cleaned, Subject.id != subject_id)
        ).first()
        if clash is not None:
            raise HTTPException(status_code=409, detail="Matière déjà existante")
        subject.name = cleaned
        subject.slug = slugify(cleaned)
        changes["name"] = cleaned
    if is_active is not None:
        subject.is_active = is_active
        changes["is_active"] = is_active
    if not changes:
        raise HTTPException(status_code=422, detail="Aucune modification")
    write_audit(
        db,
        action="subject.updated",
        resource_type="subject",
        resource_id=str(subject.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata=changes,
    )
    db.commit()
    db.refresh(subject)
    return subject


def link_subject_to_level(
    db: Session,
    *,
    level_code: str,
    subject_id: UUID,
    actor_id: UUID,
    correlation_id: str | None,
) -> LevelSubject:
    _ensure_level(db, level_code)
    subject = db.get(Subject, subject_id)
    if subject is None or not subject.is_active:
        raise HTTPException(status_code=404, detail="Matière inconnue")
    existing = db.scalars(
        select(LevelSubject).where(
            LevelSubject.level_code == level_code,
            LevelSubject.subject_id == subject_id,
        )
    ).first()
    if existing is not None:
        return existing
    link = LevelSubject(level_code=level_code, subject_id=subject_id)
    db.add(link)
    db.flush()
    write_audit(
        db,
        action="level_subject.linked",
        resource_type="level_subject",
        resource_id=str(link.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"level_code": level_code, "subject_id": str(subject_id)},
    )
    db.commit()
    db.refresh(link)
    return link


def unlink_subject_from_level(
    db: Session,
    *,
    level_code: str,
    subject_id: UUID,
    actor_id: UUID,
    correlation_id: str | None,
) -> None:
    link = db.scalars(
        select(LevelSubject).where(
            LevelSubject.level_code == level_code,
            LevelSubject.subject_id == subject_id,
        )
    ).first()
    if link is None:
        raise HTTPException(status_code=404, detail="Lien niveau–matière introuvable")
    link_id = str(link.id)
    db.delete(link)
    write_audit(
        db,
        action="level_subject.unlinked",
        resource_type="level_subject",
        resource_id=link_id,
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"level_code": level_code, "subject_id": str(subject_id)},
    )
    db.commit()


def create_chapter(
    db: Session,
    *,
    subject_id: UUID,
    level_code: str,
    title: str,
    sort_order: int,
    actor_id: UUID,
    correlation_id: str | None,
) -> Chapter:
    subject = db.get(Subject, subject_id)
    if subject is None or not subject.is_active:
        raise HTTPException(status_code=404, detail="Matière inconnue")
    _ensure_level(db, level_code)
    cleaned = title.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail="Titre de chapitre requis")
    clash = db.scalars(
        select(Chapter).where(
            Chapter.subject_id == subject_id,
            Chapter.level_code == level_code,
            Chapter.title == cleaned,
        )
    ).first()
    if clash is not None:
        raise HTTPException(status_code=409, detail="Chapitre déjà existant")
    chapter = Chapter(
        subject_id=subject_id,
        level_code=level_code,
        title=cleaned,
        sort_order=sort_order,
        is_active=True,
    )
    db.add(chapter)
    db.flush()
    write_audit(
        db,
        action="chapter.created",
        resource_type="chapter",
        resource_id=str(chapter.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={
            "subject_id": str(subject_id),
            "level_code": level_code,
            "title": cleaned,
        },
    )
    db.commit()
    db.refresh(chapter)
    return chapter


def update_chapter(
    db: Session,
    *,
    chapter_id: UUID,
    actor_id: UUID,
    correlation_id: str | None,
    title: str | None = None,
    sort_order: int | None = None,
    is_active: bool | None = None,
) -> Chapter:
    chapter = db.get(Chapter, chapter_id)
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapitre inconnu")
    changes: dict = {}
    if title is not None:
        cleaned = title.strip()
        if not cleaned:
            raise HTTPException(status_code=422, detail="Titre de chapitre requis")
        clash = db.scalars(
            select(Chapter).where(
                Chapter.subject_id == chapter.subject_id,
                Chapter.level_code == chapter.level_code,
                Chapter.title == cleaned,
                Chapter.id != chapter_id,
            )
        ).first()
        if clash is not None:
            raise HTTPException(status_code=409, detail="Chapitre déjà existant")
        chapter.title = cleaned
        changes["title"] = cleaned
    if sort_order is not None:
        chapter.sort_order = sort_order
        changes["sort_order"] = sort_order
    if is_active is not None:
        chapter.is_active = is_active
        changes["is_active"] = is_active
    if not changes:
        raise HTTPException(status_code=422, detail="Aucune modification")
    write_audit(
        db,
        action="chapter.updated",
        resource_type="chapter",
        resource_id=str(chapter.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata=changes,
    )
    db.commit()
    db.refresh(chapter)
    return chapter


def create_notion(
    db: Session,
    *,
    chapter_id: UUID,
    title: str,
    sort_order: int,
    actor_id: UUID,
    correlation_id: str | None,
) -> Notion:
    chapter = db.get(Chapter, chapter_id)
    if chapter is None or not chapter.is_active:
        raise HTTPException(status_code=404, detail="Chapitre inconnu")
    cleaned = title.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail="Titre de notion requis")
    clash = db.scalars(
        select(Notion).where(Notion.chapter_id == chapter_id, Notion.title == cleaned)
    ).first()
    if clash is not None:
        raise HTTPException(status_code=409, detail="Notion déjà existante")
    notion = Notion(
        chapter_id=chapter_id,
        title=cleaned,
        sort_order=sort_order,
        is_active=True,
    )
    db.add(notion)
    db.flush()
    write_audit(
        db,
        action="notion.created",
        resource_type="notion",
        resource_id=str(notion.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata={"chapter_id": str(chapter_id), "title": cleaned},
    )
    db.commit()
    db.refresh(notion)
    return notion


def update_notion(
    db: Session,
    *,
    notion_id: UUID,
    actor_id: UUID,
    correlation_id: str | None,
    title: str | None = None,
    sort_order: int | None = None,
    is_active: bool | None = None,
) -> Notion:
    notion = db.get(Notion, notion_id)
    if notion is None:
        raise HTTPException(status_code=404, detail="Notion inconnue")
    changes: dict = {}
    if title is not None:
        cleaned = title.strip()
        if not cleaned:
            raise HTTPException(status_code=422, detail="Titre de notion requis")
        clash = db.scalars(
            select(Notion).where(
                Notion.chapter_id == notion.chapter_id,
                Notion.title == cleaned,
                Notion.id != notion_id,
            )
        ).first()
        if clash is not None:
            raise HTTPException(status_code=409, detail="Notion déjà existante")
        notion.title = cleaned
        changes["title"] = cleaned
    if sort_order is not None:
        notion.sort_order = sort_order
        changes["sort_order"] = sort_order
    if is_active is not None:
        notion.is_active = is_active
        changes["is_active"] = is_active
    if not changes:
        raise HTTPException(status_code=422, detail="Aucune modification")
    write_audit(
        db,
        action="notion.updated",
        resource_type="notion",
        resource_id=str(notion.id),
        actor_id=actor_id,
        correlation_id=correlation_id,
        metadata=changes,
    )
    db.commit()
    db.refresh(notion)
    return notion


def list_audit(db: Session, *, limit: int = 50) -> list:
    from app.infrastructure.models import AuditLog

    capped = max(1, min(limit, 200))
    return list(
        db.scalars(
            select(AuditLog).order_by(AuditLog.at.desc()).limit(capped)
        ).all()
    )


def _ensure_level(db: Session, level_code: str) -> Level:
    level = db.get(Level, level_code)
    if level is None or not level.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Niveau inconnu",
        )
    return level
