from datetime import datetime, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProfileCreate(BaseModel):
    bio: str | None = Field(default=None, max_length=2000)


class CompetencyCreate(BaseModel):
    level_code: str = Field(min_length=1, max_length=64)
    subject_id: UUID


class AvailabilityCreate(BaseModel):
    weekday: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    timezone: str = "Africa/Porto-Novo"


class CompetencyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    level_code: str
    subject_id: UUID


class AvailabilityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    weekday: int
    start_time: time
    end_time: time
    timezone: str
    is_active: bool


class TrainerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    status: str
    bio: str | None
    created_at: datetime
    updated_at: datetime
    competencies: list[CompetencyOut] = []
    availabilities: list[AvailabilityOut] = []


class TrainerListResponse(BaseModel):
    items: list[TrainerOut]


class DifficultyProjectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    difficulty_id: UUID
    level_code: str
    subject_id: UUID
    status: str
    received_at: datetime


class CompatibleDifficultiesResponse(BaseModel):
    items: list[DifficultyProjectionOut]
