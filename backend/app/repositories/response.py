from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.response import SurveyResponse


class ResponseRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_survey_and_participant(self, survey_id, participant_id) -> SurveyResponse | None:
        result = await self.session.execute(
            select(SurveyResponse).where(
                SurveyResponse.survey_id == survey_id,
                SurveyResponse.participant_id == participant_id,
            )
        )
        return result.scalar_one_or_none()

    async def save(self, survey_response: SurveyResponse) -> SurveyResponse:
        self.session.add(survey_response)
        await self.session.flush()
        return survey_response

