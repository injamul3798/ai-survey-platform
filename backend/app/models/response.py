import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import TimestampedUUIDModel


class SurveyResponse(TimestampedUUIDModel):
    __tablename__ = "survey_responses"
    __table_args__ = (UniqueConstraint("survey_id", "participant_id"),)

    survey_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    participant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("participants.id", ondelete="CASCADE"),
        nullable=False,
    )
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    survey = relationship("Survey", back_populates="responses")
    participant = relationship("Participant", back_populates="responses")
    answers = relationship("SurveyResponseAnswer", back_populates="response", cascade="all, delete-orphan")


class SurveyResponseAnswer(TimestampedUUIDModel):
    __tablename__ = "survey_response_answers"

    response_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("survey_responses.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("survey_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    selected_option_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("survey_question_options.id", ondelete="CASCADE"),
        nullable=False,
    )
    selected_option_text: Mapped[str] = mapped_column(Text, nullable=False)

    response = relationship("SurveyResponse", back_populates="answers")
