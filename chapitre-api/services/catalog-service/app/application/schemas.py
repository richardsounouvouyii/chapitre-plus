from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class LevelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    label: str
    sort_order: int
    is_active: bool


class SubjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    is_active: bool


class ChapterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    subject_id: UUID
    level_code: str
    title: str
    sort_order: int
    is_active: bool


class NotionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    chapter_id: UUID
    title: str
    sort_order: int
    is_active: bool


class LevelsResponse(BaseModel):
    levels: list[LevelOut]
    label: str


class SubjectsResponse(BaseModel):
    items: list[SubjectOut]


class ChaptersResponse(BaseModel):
    items: list[ChapterOut]


class NotionsResponse(BaseModel):
    items: list[NotionOut]


class SubjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    level_codes: list[str] = Field(default_factory=list)


class SubjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    is_active: bool | None = None


class LevelSubjectLink(BaseModel):
    subject_id: UUID


class ChapterCreate(BaseModel):
    subject_id: UUID
    level_code: str = Field(min_length=1, max_length=64)
    title: str = Field(min_length=1, max_length=255)
    sort_order: int = 0


class ChapterUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    sort_order: int | None = None
    is_active: bool | None = None


class NotionCreate(BaseModel):
    chapter_id: UUID
    title: str = Field(min_length=1, max_length=255)
    sort_order: int = 0


class NotionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    sort_order: int | None = None
    is_active: bool | None = None


class AuditOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    actor_id: UUID | None
    action: str
    resource_type: str
    resource_id: str
    at: datetime
    correlation_id: str | None
    metadata: dict[str, Any] | None = Field(
        default=None,
        validation_alias=AliasChoices("metadata_json", "metadata"),
    )


class AuditListResponse(BaseModel):
    items: list[AuditOut]
