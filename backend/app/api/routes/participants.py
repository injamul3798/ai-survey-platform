from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import get_current_user, get_db_session
from backend.app.schemas.participant import ParticipantCreate, ParticipantListItem, ParticipantResponse, ParticipantUpdate
from backend.app.services.participant import ParticipantService

router = APIRouter()


@router.get("", response_model=list[ParticipantListItem])
async def list_participants(
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> list[ParticipantListItem]:
    return await ParticipantService(session).list_participants()


@router.post("", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED)
async def create_participant(
    payload: ParticipantCreate,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> ParticipantResponse:
    return await ParticipantService(session).create_participant(payload)


@router.patch("/{participant_id}", response_model=ParticipantResponse)
async def update_participant(
    participant_id: str,
    payload: ParticipantUpdate,
    session: AsyncSession = Depends(get_db_session),
    _user=Depends(get_current_user),
) -> ParticipantResponse:
    return await ParticipantService(session).update_participant(participant_id, payload)
