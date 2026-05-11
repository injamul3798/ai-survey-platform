from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.invitation import SurveyInvitation
from backend.app.models.participant import Participant
from backend.app.models.response import SurveyResponse
from backend.app.models.survey import Survey, SurveyQuestion


class SurveyRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_all(self) -> list[Survey]:
        result = await self.session.execute(
            select(Survey)
            .options(selectinload(Survey.questions).selectinload(SurveyQuestion.options))
            .order_by(Survey.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, survey_id: str) -> Survey | None:
        result = await self.session.execute(
            select(Survey)
            .options(selectinload(Survey.questions).selectinload(SurveyQuestion.options))
            .where(Survey.id == survey_id)
        )
        return result.scalar_one_or_none()

    async def save(self, survey: Survey) -> Survey:
        self.session.add(survey)
        await self.session.flush()
        return survey

    async def count_active_participants(self) -> int:
        result = await self.session.execute(
            select(func.count(Participant.id)).where(Participant.is_active.is_(True))
        )
        return int(result.scalar_one())

    async def count_sent_invitations(self, survey_id) -> int:
        result = await self.session.execute(
            select(func.count(SurveyInvitation.id)).where(
                SurveyInvitation.survey_id == survey_id,
                SurveyInvitation.email_sent.is_(True),
            )
        )
        return int(result.scalar_one())

    async def has_response(self, survey_id, participant_id) -> bool:
        result = await self.session.execute(
            select(SurveyResponse.id).where(
                SurveyResponse.survey_id == survey_id,
                SurveyResponse.participant_id == participant_id,
            )
        )
        return result.scalar_one_or_none() is not None
