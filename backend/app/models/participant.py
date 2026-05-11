from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import TimestampedUUIDModel


class Participant(TimestampedUUIDModel):
    __tablename__ = "participants"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    mobile: Mapped[str] = mapped_column(String(64), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    survey_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    invitations = relationship("SurveyInvitation", back_populates="participant")
    responses = relationship("SurveyResponse", back_populates="participant")
