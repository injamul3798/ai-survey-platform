import uuid

from sqlalchemy import ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import TimestampedUUIDModel


class Survey(TimestampedUUIDModel):
    __tablename__ = "surveys"

    title: Mapped[str] = mapped_column(Text, nullable=False)
    topic: Mapped[str] = mapped_column(Text, nullable=False)
    question_count: Mapped[int] = mapped_column(Integer, nullable=False)
    option_count: Mapped[int] = mapped_column(Integer, nullable=False)
    ai_response: Mapped[dict] = mapped_column(JSONB, nullable=False)

    questions = relationship("SurveyQuestion", back_populates="survey", cascade="all, delete-orphan")
    invitations = relationship("SurveyInvitation", back_populates="survey")
    responses = relationship("SurveyResponse", back_populates="survey")


class SurveyQuestion(TimestampedUUIDModel):
    __tablename__ = "survey_questions"
    __table_args__ = (UniqueConstraint("survey_id", "question_order"),)

    survey_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_order: Mapped[int] = mapped_column(Integer, nullable=False)

    survey = relationship("Survey", back_populates="questions")
    options = relationship("SurveyQuestionOption", back_populates="question", cascade="all, delete-orphan")


class SurveyQuestionOption(TimestampedUUIDModel):
    __tablename__ = "survey_question_options"
    __table_args__ = (UniqueConstraint("question_id", "option_order"),)

    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("survey_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(nullable=False, default=False)
    option_order: Mapped[int] = mapped_column(Integer, nullable=False)

    question = relationship("SurveyQuestion", back_populates="options")
