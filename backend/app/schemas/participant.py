from pydantic import BaseModel, EmailStr, Field

from backend.app.schemas.common import TimestampedResponse


class ParticipantCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    mobile: str = Field(min_length=1, max_length=64)
    is_active: bool = True


class ParticipantUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    mobile: str | None = Field(default=None, min_length=1, max_length=64)
    is_active: bool | None = None


class ParticipantResponse(TimestampedResponse):
    full_name: str
    email: EmailStr
    mobile: str
    is_active: bool
    survey_count: int


class ParticipantListItem(ParticipantResponse):
    pass
