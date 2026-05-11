from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.exceptions import NotFoundError
from backend.app.models.survey import Survey, SurveyQuestion, SurveyQuestionOption
from backend.app.repositories.invitation import InvitationRepository
from backend.app.repositories.participant import ParticipantRepository
from backend.app.repositories.survey import SurveyRepository
from backend.app.schemas.survey import (
    GeneratedSurveyDraft,
    QuestionRegenerateRequest,
    SurveyCreateRequest,
    SurveyGenerateRequest,
    SurveyListItem,
    SurveyResponse,
)
from backend.app.services.email import EmailService
from backend.app.services.survey_ai import SurveyAIService
from backend.app.utils.tokens import generate_email_token


class SurveyService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.survey_repository = SurveyRepository(session)
        self.participant_repository = ParticipantRepository(session)
        self.invitation_repository = InvitationRepository(session)
        self.ai_service = SurveyAIService()
        self.email_service = EmailService()

    async def list_surveys(self) -> list[SurveyListItem]:
        surveys = await self.survey_repository.list_all()
        active_participant_count = await self.survey_repository.count_active_participants()
        results = []
        for survey in surveys:
            sent_count = await self.survey_repository.count_sent_invitations(survey.id)
            results.append(
                SurveyListItem(
                    id=survey.id,
                    title=survey.title,
                    topic=survey.topic,
                    question_count=survey.question_count,
                    option_count=survey.option_count,
                    created_at=survey.created_at,
                    active_participant_count=active_participant_count,
                    sent_invitation_count=sent_count,
                )
            )
        return results

    async def generate_survey(self, payload: SurveyGenerateRequest) -> GeneratedSurveyDraft:
        return await self.ai_service.generate(payload)

    async def regenerate_question(self, payload: QuestionRegenerateRequest) -> GeneratedSurveyDraft:
        return await self.ai_service.regenerate_question(payload)

    async def create_survey(self, payload: SurveyCreateRequest) -> SurveyResponse:
        survey = Survey(
            title=payload.title.strip(),
            topic=payload.topic.strip(),
            question_count=payload.question_count,
            option_count=payload.option_count,
            ai_response=payload.ai_response.model_dump(),
        )

        for question_index, question_input in enumerate(payload.questions):
            question = SurveyQuestion(
                question_text=question_input.question_text.strip(),
                question_order=question_index,
            )
            for option_index, option_input in enumerate(question_input.options):
                question.options.append(
                    SurveyQuestionOption(
                        option_text=option_input.option_text.strip(),
                        is_correct=option_input.is_correct,
                        option_order=option_index,
                    )
                )
            survey.questions.append(question)

        await self.survey_repository.save(survey)
        await self.session.commit()
        return await self._build_response(survey)

    async def send_invitations(self, survey_id: str) -> SurveyResponse:
        survey = await self.survey_repository.get_by_id(survey_id)
        if survey is None:
            raise NotFoundError("Survey not found")

        participants = await self.participant_repository.list_active()
        for participant in participants:
            invitation = await self.invitation_repository.get_by_survey_and_participant(survey.id, participant.id)
            if invitation is None:
                invitation = await self.invitation_repository.create(survey.id, participant.id, generate_email_token())

            survey_link = f"{settings.normalized_frontend_base_url}/survey/submit/{invitation.email_token}"
            from datetime import UTC, datetime

            try:
                await self.email_service.send_invitation(participant.full_name, participant.email, survey_link)
                invitation.email_sent = True
                invitation.sent_at = datetime.now(UTC)
            except Exception:  # noqa: BLE001
                invitation.email_sent = False
                invitation.sent_at = None

        await self.session.commit()
        return await self._build_response(survey)

    async def _build_response(self, survey: Survey) -> SurveyResponse:
        active_participant_count = await self.survey_repository.count_active_participants()
        sent_count = await self.survey_repository.count_sent_invitations(survey.id)
        await self.session.refresh(survey)
        return SurveyResponse(
            id=survey.id,
            title=survey.title,
            topic=survey.topic,
            question_count=survey.question_count,
            option_count=survey.option_count,
            ai_response=survey.ai_response,
            created_at=survey.created_at,
            updated_at=survey.updated_at,
            active_participant_count=active_participant_count,
            sent_invitation_count=sent_count,
            questions=[
                {
                    "id": question.id,
                    "survey_id": question.survey_id,
                    "question_text": question.question_text,
                    "question_order": question.question_order,
                    "created_at": question.created_at,
                    "updated_at": question.updated_at,
                    "options": [
                        {
                            "id": option.id,
                            "question_id": option.question_id,
                            "option_text": option.option_text,
                            "is_correct": option.is_correct,
                            "option_order": option.option_order,
                            "created_at": option.created_at,
                            "updated_at": option.updated_at,
                        }
                        for option in sorted(question.options, key=lambda item: item.option_order)
                    ],
                }
                for question in sorted(survey.questions, key=lambda item: item.question_order)
            ],
        )
