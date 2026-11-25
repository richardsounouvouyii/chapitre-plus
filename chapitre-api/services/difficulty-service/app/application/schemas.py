from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DifficultyCreate(BaseModel):
    level_code: str = Field(min_length=1, max_length=64)
    subject_id: UUID
    chapter_id: UUID | None = None
    notion: str | None = Field(default=None, max_length=255)
    description: str = Field(min_length=10, max_length=4000)
    preferences: str | None = Field(default=None, max_length=2000)


class DifficultyStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=32)


class DifficultyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    level_code: str
    subject_id: UUID
    chapter_id: UUID | None
    notion: str | None
    description: str
    preferences: str | None
    status: str
    created_at: datetime
    updated_at: datetime


class DifficultyListResponse(BaseModel):
    items: list[DifficultyOut]
