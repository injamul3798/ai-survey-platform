from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from backend.app.schemas.common import TimestampedResponse


class SurveyGenerateRequest(BaseModel):
    topic: str = Field(min_length=1)
    question_count: int = Field(default=3, ge=1, le=3)
    option_count: int = Field(default=4, ge=2, le=6)


class GeneratedQuestion(BaseModel):
    question: str = Field(min_length=1)
    options: list[str] = Field(min_length=2, max_length=6)
    correct_answer_index: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_values(self):
        if self.correct_answer_index >= len(self.options):
            raise ValueError("Correct answer index is out of range")
        if any(not option.strip() for option in self.options):
            raise ValueError("Options cannot be blank")
        if not self.question.strip():
            raise ValueError("Question cannot be blank")
        return self


class GeneratedSurveyDraft(BaseModel):
    title: str = Field(min_length=1)
    questions: list[GeneratedQuestion] = Field(min_length=1, max_length=3)


class QuestionRegenerateRequest(BaseModel):
    topic: str = Field(min_length=1)
    title: str = Field(min_length=1)
    question_count: int = Field(ge=1, le=3)
    option_count: int = Field(ge=2, le=6)
    target_index: int = Field(ge=0, le=2)
    questions: list[GeneratedQuestion] = Field(min_length=1, max_length=3)

    @model_validator(mode="after")
    def validate_target_index(self):
        if len(self.questions) != self.question_count:
            raise ValueError("Question count does not match request")
        if self.target_index >= self.question_count:
            raise ValueError("Target index is out of range")
        return self


class SurveyOptionInput(BaseModel):
    option_text: str = Field(min_length=1)
    is_correct: bool = False


class SurveyQuestionInput(BaseModel):
    question_text: str = Field(min_length=1)
    options: list[SurveyOptionInput] = Field(min_length=2, max_length=6)

    @model_validator(mode="after")
    def validate_single_correct_answer(self):
        correct_answers = sum(1 for option in self.options if option.is_correct)
        if correct_answers != 1:
            raise ValueError("Each question must have exactly one correct answer")
        return self


class SurveyCreateRequest(BaseModel):
    title: str = Field(min_length=1)
    topic: str = Field(min_length=1)
    question_count: int = Field(ge=1, le=3)
    option_count: int = Field(ge=2, le=6)
    ai_response: GeneratedSurveyDraft
    questions: list[SurveyQuestionInput] = Field(min_length=1, max_length=3)

    @model_validator(mode="after")
    def validate_counts(self):
        if len(self.questions) != self.question_count:
            raise ValueError("Question count does not match")
        if len(self.ai_response.questions) != self.question_count:
            raise ValueError("AI response question count does not match")
        for question in self.questions:
            if len(question.options) != self.option_count:
                raise ValueError("Option count does not match")
        for question in self.ai_response.questions:
            if len(question.options) != self.option_count:
                raise ValueError("AI response option count does not match")
        return self


class SurveyQuestionOptionResponse(TimestampedResponse):
    question_id: UUID
    option_text: str
    is_correct: bool
    option_order: int


class SurveyQuestionResponse(TimestampedResponse):
    survey_id: UUID
    question_text: str
    question_order: int
    options: list[SurveyQuestionOptionResponse]


class SurveyResponse(TimestampedResponse):
    title: str
    topic: str
    question_count: int
    option_count: int
    ai_response: dict
    active_participant_count: int = 0
    sent_invitation_count: int = 0
    questions: list[SurveyQuestionResponse]


class SurveyListItem(BaseModel):
    id: UUID
    title: str
    topic: str
    question_count: int
    option_count: int
    created_at: datetime
    active_participant_count: int
    sent_invitation_count: int
