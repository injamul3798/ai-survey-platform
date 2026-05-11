from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PublicSurveyOption(BaseModel):
    id: UUID
    option_text: str
    option_order: int


class PublicSurveyQuestion(BaseModel):
    id: UUID
    question_text: str
    question_order: int
    options: list[PublicSurveyOption]


class PublicInvitationDetail(BaseModel):
    survey_id: UUID
    survey_title: str
    participant_name: str
    answered: bool
    questions: list[PublicSurveyQuestion]


class SurveyAnswerSubmission(BaseModel):
    question_id: UUID
    selected_option_id: UUID


class SurveySubmissionRequest(BaseModel):
    answers: list[SurveyAnswerSubmission] = Field(min_length=1)


class SurveySubmissionResponse(BaseModel):
    response_id: UUID
    submitted_at: datetime
    message: str

