from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.participant import Participant


class ParticipantRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_all(self) -> list[Participant]:
        result = await self.session.execute(select(Participant).order_by(Participant.created_at.desc()))
        return list(result.scalars().all())

    async def list_active(self) -> list[Participant]:
        result = await self.session.execute(
            select(Participant).where(Participant.is_active.is_(True)).order_by(Participant.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_email(self, email: str) -> Participant | None:
        result = await self.session.execute(select(Participant).where(Participant.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, participant_id: str) -> Participant | None:
        result = await self.session.execute(select(Participant).where(Participant.id == participant_id))
        return result.scalar_one_or_none()

    async def save(self, participant: Participant) -> Participant:
        self.session.add(participant)
        await self.session.flush()
        return participant

