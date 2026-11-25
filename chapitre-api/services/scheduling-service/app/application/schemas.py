from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class VenueCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    address: str = Field(min_length=1, max_length=255)
    city: str = Field(default="Cotonou", max_length=120)
    capacity_hint: int | None = Field(default=None, ge=1)


class VenueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    address: str
    city: str
    capacity_hint: int | None


class SessionCreate(BaseModel):
    venue_id: UUID
    level_code: str = Field(min_length=1, max_length=64)
    subject_id: UUID
    chapter_id: UUID | None = None
    title: str = Field(min_length=1, max_length=255)
    starts_at: datetime
    ends_at: datetime
    capacity: int = Field(ge=1, le=200)
    price_xof: int = Field(ge=0, description="XOF entier")
    notes: str | None = Field(default=None, max_length=2000)


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    trainer_id: UUID
    trainer_user_id: UUID
    venue_id: UUID
    level_code: str
    subject_id: UUID
    chapter_id: UUID | None
    title: str
    starts_at: datetime
    ends_at: datetime
    capacity: int
    status: str
    price_xof: int
    price_status: str
    notes: str | None
    created_at: datetime
    updated_at: datetime


class SessionListResponse(BaseModel):
    items: list[SessionOut]


class VenueListResponse(BaseModel):
    items: list[VenueOut]
