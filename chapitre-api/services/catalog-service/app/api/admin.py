from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import AuthPrincipal, require_admin
from app.application import admin_commands
from app.application.schemas import (
    AuditListResponse,
    AuditOut,
    ChapterCreate,
    ChapterOut,
    ChapterUpdate,
    LevelSubjectLink,
    NotionCreate,
    NotionOut,
    NotionUpdate,
    SubjectCreate,
    SubjectOut,
    SubjectUpdate,
)
from app.infrastructure.database import get_db

router = APIRouter(prefix="/admin", tags=["catalog-admin"])


@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def admin_create_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    admin: AuthPrincipal = Depends(require_admin),
) -> SubjectOut:
    row = admin_commands.create_subject(
        db,
        name=payload.name,
        level_codes=payload.level_codes,
        actor_id=admin.user_id,
        correlation_id=admin.correlation_id,
    )
    return SubjectOut.model_validate(row)


@router.patch("/subjects/{subject_id}", response_model=SubjectOut)
def admin_update_subject(
    subject_id: UUID,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
    admin: AuthPrincipal = Depends(require_admin),
) -> SubjectOut:
    row = admin_commands.update_subject(
        db,
        subject_id=subject_id,
        name=payload.name,
        is_active=payload.is_active,
        actor_id=admin.user_id,
        correlation_id=admin.correlation_id,
    )
    return SubjectOut.model_validate(row)


@router.post(
    "/levels/{level_code}/subjects",
    status_code=status.HTTP_201_CREATED,
)
def admin_link_subject(
    level_code: str,
    payload: LevelSubjectLink,
    db: Session = Depends(get_db),
    admin: AuthPrincipal = Depends(require_admin),
) -> dict[str, str]:
    link = admin_commands.link_subject_to_level(
        db,
        level_code=level_code,
        subject_id=payload.subject_id,
        actor_id=admin.user_id,
        correlation_id=admin.correlation_id,
    )
    return {"id": str(link.id), "level_code": link.level_code, "subject_id": str(link.subject_id)}


@router.delete(
    "/levels/{level_code}/subjects/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def admin_unlink_subject(
    level_code: str,
    subject_id: UUID,
    db: Session = Depends(get_db),
    admin: AuthPrincipal = Depends(require_admin),
) -> None:
    admin_commands.unlink_subject_from_level(
        db,
        level_code=level_code,
        subject_id=subject_id,
        actor_id=admin.user_id,
        correlation_id=admin.correlation_id,
    )


@router.post("/chapters", response_model=ChapterOut, status_code=status.HTTP_201_CREATED)
def admin_create_chapter(
    payload: ChapterCreate,
    db: Session = Depends(get_db),
    admin: AuthPrincipal = Depends(require_admin),
) -> ChapterOut:
    row = admin_commands.create_chapter(
        db,
        subject_id=payload.subject_id,
        level_code=payload.level_code,
        title=payload.title,
        sort_order=payload.sort_order,
        actor_id=admin.user_id,
        correlation_id=admin.correlation_id,
    )
    return ChapterOut.model_validate(row)


@router.patch("/chapters/{chapter_id}", response_model=ChapterOut)
def admin_update_chapter(
    chapter_id: UUID,
    payload: ChapterUpdate,
    db: Session = Depends(get_db),
    admin: AuthPrincipal = Depends(require_admin),
) -> ChapterOut:
    row = admin_commands.update_chapter(
        db,
        chapter_id=chapter_id,
        title=payload.title,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
        actor_id=admin.user_id,
        correlation_id=admin.correlation_id,
    )
    return ChapterOut.model_validate(row)


@router.post("/notions", response_model=NotionOut, status_code=status.HTTP_201_CREATED)
def admin_create_notion(
    payload: NotionCreate,
    db: Session = Depends(get_db),
    admin: AuthPrincipal = Depends(require_admin),
) -> NotionOut:
    row = admin_commands.create_notion(
        db,
        chapter_id=payload.chapter_id,
        title=payload.title,
        sort_order=payload.sort_order,
        actor_id=admin.user_id,
        correlation_id=admin.correlation_id,
    )
    return NotionOut.model_validate(row)


@router.patch("/notions/{notion_id}", response_model=NotionOut)
def admin_update_notion(
    notion_id: UUID,
    payload: NotionUpdate,
    db: Session = Depends(get_db),
    admin: AuthPrincipal = Depends(require_admin),
) -> NotionOut:
    row = admin_commands.update_notion(
        db,
        notion_id=notion_id,
        title=payload.title,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
        actor_id=admin.user_id,
        correlation_id=admin.correlation_id,
    )
    return NotionOut.model_validate(row)


@router.get("/audit", response_model=AuditListResponse)
def admin_list_audit(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: AuthPrincipal = Depends(require_admin),
) -> AuditListResponse:
    rows = admin_commands.list_audit(db, limit=limit)
    return AuditListResponse(items=[AuditOut.model_validate(r) for r in rows])
