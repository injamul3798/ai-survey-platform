from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.invitation import SurveyInvitation
from backend.app.models.survey import Survey, SurveyQuestion


class InvitationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_token(self, token: str) -> SurveyInvitation | None:
        result = await self.session.execute(
            select(SurveyInvitation)
            .options(
                selectinload(SurveyInvitation.survey)
                .selectinload(Survey.questions)
                .selectinload(SurveyQuestion.options),
                selectinload(SurveyInvitation.participant),
            )
            .where(SurveyInvitation.email_token == token)
        )
        return result.scalar_one_or_none()

    async def get_by_survey_and_participant(self, survey_id: UUID, participant_id: UUID) -> SurveyInvitation | None:
        result = await self.session.execute(
            select(SurveyInvitation).where(
                SurveyInvitation.survey_id == survey_id,
                SurveyInvitation.participant_id == participant_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, survey_id: UUID, participant_id: UUID, token: str) -> SurveyInvitation:
        invitation = SurveyInvitation(
            id=uuid4(),
            survey_id=survey_id,
            participant_id=participant_id,
            email_token=token,
            created_at=datetime.now(UTC),
        )
        self.session.add(invitation)
        await self.session.flush()
        return invitation
