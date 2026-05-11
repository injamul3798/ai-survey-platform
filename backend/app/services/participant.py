from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.exceptions import ConflictError, NotFoundError
from backend.app.repositories.participant import ParticipantRepository
from backend.app.schemas.participant import ParticipantCreate, ParticipantListItem, ParticipantResponse, ParticipantUpdate


class ParticipantService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = ParticipantRepository(session)

    async def list_participants(self) -> list[ParticipantListItem]:
        participants = await self.repository.list_all()
        return [ParticipantListItem.model_validate(participant) for participant in participants]

    async def create_participant(self, payload: ParticipantCreate) -> ParticipantResponse:
        existing = await self.repository.get_by_email(payload.email)
        if existing:
            raise ConflictError("Participant email must be unique")

        participant = Participant(
            full_name=payload.full_name.strip(),
            email=payload.email,
            mobile=payload.mobile.strip(),
            is_active=payload.is_active,
        )
        await self.repository.save(participant)
        await self.session.commit()
        await self.session.refresh(participant)
        return ParticipantResponse.model_validate(participant)

    async def update_participant(self, participant_id: str, payload: ParticipantUpdate) -> ParticipantResponse:
        participant = await self.repository.get_by_id(participant_id)
        if participant is None:
            raise NotFoundError("Participant not found")

        if payload.email and payload.email != participant.email:
            existing = await self.repository.get_by_email(payload.email)
            if existing:
                raise ConflictError("Participant email must be unique")
            participant.email = payload.email

        if payload.full_name is not None:
            participant.full_name = payload.full_name.strip()
        if payload.mobile is not None:
            participant.mobile = payload.mobile.strip()
        if payload.is_active is not None:
            participant.is_active = payload.is_active

        await self.repository.save(participant)
        await self.session.commit()
        await self.session.refresh(participant)
        return ParticipantResponse.model_validate(participant)
