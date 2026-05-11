from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import get_db_session
from backend.app.schemas.public import PublicInvitationDetail, SurveySubmissionRequest, SurveySubmissionResponse
from backend.app.services.public_submission import PublicSubmissionService

router = APIRouter()


@router.get("/invitations/{token}", response_model=PublicInvitationDetail)
async def get_invitation(token: str, session: AsyncSession = Depends(get_db_session)) -> PublicInvitationDetail:
    return await PublicSubmissionService(session).get_invitation_detail(token)


@router.post("/invitations/{token}/submit", response_model=SurveySubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_survey(
    token: str,
    payload: SurveySubmissionRequest,
    session: AsyncSession = Depends(get_db_session),
) -> SurveySubmissionResponse:
    return await PublicSubmissionService(session).submit(token, payload)
