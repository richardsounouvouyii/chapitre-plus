from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.domain.enums import Role
from app.domain.levels import SUPPORTED_STUDENT_LEVELS, is_supported_student_level


class RegisterStudentRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=120)
    last_name: str = Field(min_length=1, max_length=120)
    level: str
    city: str = Field(min_length=1, max_length=120)
    school_id: str | None = Field(default=None, max_length=64)
    school_name: str | None = Field(default=None, max_length=255)
    declared_guardian: bool = False

    @field_validator("level")
    @classmethod
    def validate_level(cls, value: str) -> str:
        if not is_supported_student_level(value):
            raise ValueError(
                f"Classe non supportée. Autorisées : {', '.join(SUPPORTED_STUDENT_LEVELS)}"
            )
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class InviteUserRequest(BaseModel):
    email: EmailStr
    role: Role
    first_name: str | None = Field(default=None, max_length=120)
    last_name: str | None = Field(default=None, max_length=120)

    @field_validator("role")
    @classmethod
    def validate_invite_role(cls, value: Role) -> Role:
        if value == Role.STUDENT:
            raise ValueError("L'élève s'inscrit seul — pas d'invitation STUDENT")
        return value


class SetPasswordRequest(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: UUID
    roles: list[str]


class InviteUserResponse(BaseModel):
    invitation_id: UUID
    user_id: UUID
    email: EmailStr
    role: str
    expires_at: datetime
    email_delivery: str = "queued"



class StudentProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    level: str
    city: str | None
    school_id: str | None
    school_name: str | None
    declared_guardian: bool


class MeResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str | None
    last_name: str | None
    status: str
    roles: list[str]
    student_profile: StudentProfileOut | None = None
