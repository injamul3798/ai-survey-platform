from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import get_current_user, get_db_session
from backend.app.schemas.survey import (
    GeneratedSurveyDraft,
    QuestionRegenerateRequest,
    SurveyCreateRequest,
    SurveyGenerateRequest,
    SurveyListItem,
    SurveyResponse,
)
from backend.app.services.survey import SurveyService

router = APIRouter()


@router.get("", response_model=list[SurveyListItem])
async def list_surveys(
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> list[SurveyListItem]:
    return await SurveyService(session).list_surveys()


@router.get("/{survey_id}", response_model=SurveyResponse)
async def get_survey(
    survey_id: str,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> SurveyResponse:
    return await SurveyService(session).get_survey(survey_id)


@router.post("/generate", response_model=GeneratedSurveyDraft)
async def generate_survey(
    payload: SurveyGenerateRequest,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> GeneratedSurveyDraft:
    return await SurveyService(session).generate_survey(payload)


@router.post("/generate-question", response_model=GeneratedSurveyDraft)
async def regenerate_question(
    payload: QuestionRegenerateRequest,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> GeneratedSurveyDraft:
    return await SurveyService(session).regenerate_question(payload)


@router.post("", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
async def create_survey(
    payload: SurveyCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> SurveyResponse:
    return await SurveyService(session).create_survey(payload)


@router.post("/{survey_id}/send-invitations", response_model=SurveyResponse)
async def send_invitations(
    survey_id: str,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> SurveyResponse:
    return await SurveyService(session).send_invitations(survey_id)
