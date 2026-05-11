from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.exceptions import ConflictError, NotFoundError, ValidationError
from backend.app.models.response import SurveyResponse, SurveyResponseAnswer
from backend.app.repositories.invitation import InvitationRepository
from backend.app.repositories.response import ResponseRepository
from backend.app.schemas.public import PublicInvitationDetail, PublicSurveyOption, PublicSurveyQuestion, SurveySubmissionRequest, SurveySubmissionResponse


class PublicSubmissionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.invitation_repository = InvitationRepository(session)
        self.response_repository = ResponseRepository(session)

    async def get_invitation_detail(self, token: str) -> PublicInvitationDetail:
        invitation = await self.invitation_repository.get_by_token(token)
        if invitation is None:
            raise NotFoundError("Invitation not found")

        answered = await self.response_repository.get_by_survey_and_participant(
            invitation.survey_id, invitation.participant_id
        )
        questions = []
        for question in sorted(invitation.survey.questions, key=lambda item: item.question_order):
            questions.append(
                PublicSurveyQuestion(
                    id=question.id,
                    question_text=question.question_text,
                    question_order=question.question_order,
                    options=[
                        PublicSurveyOption(
                            id=option.id,
                            option_text=option.option_text,
                            option_order=option.option_order,
                        )
                        for option in sorted(question.options, key=lambda item: item.option_order)
                    ],
                )
            )

        return PublicInvitationDetail(
            survey_id=invitation.survey.id,
            survey_title=invitation.survey.title,
            participant_name=invitation.participant.full_name,
            answered=answered is not None,
            questions=questions,
        )

    async def submit(self, token: str, payload: SurveySubmissionRequest) -> SurveySubmissionResponse:
        invitation = await self.invitation_repository.get_by_token(token)
        if invitation is None:
            raise NotFoundError("Invitation not found")

        existing_response = await self.response_repository.get_by_survey_and_participant(
            invitation.survey_id, invitation.participant_id
        )
        if existing_response is not None:
            raise ConflictError("Survey has already been submitted")

        survey_questions = {question.id: question for question in invitation.survey.questions}
        if len(payload.answers) != len(survey_questions):
            raise ValidationError("All questions must be answered")

        submitted_question_ids = {answer.question_id for answer in payload.answers}
        if submitted_question_ids != set(survey_questions.keys()):
            raise ValidationError("Answers must cover all questions exactly once")

        for answer in payload.answers:
            question = survey_questions.get(answer.question_id)
            if question is None:
                raise ValidationError("Invalid question submitted")

            selected_option = next((option for option in question.options if option.id == answer.selected_option_id), None)
            if selected_option is None:
                raise ValidationError("Selected option does not belong to the question")

        survey_response = SurveyResponse(survey_id=invitation.survey_id, participant_id=invitation.participant_id)
        await self.response_repository.save(survey_response)

        for answer in payload.answers:
            question = survey_questions[answer.question_id]
            selected_option = next(option for option in question.options if option.id == answer.selected_option_id)
            self.session.add(
                SurveyResponseAnswer(
                    id=uuid4(),
                    response_id=survey_response.id,
                    question_id=question.id,
                    selected_option_id=selected_option.id,
                    selected_option_text=selected_option.option_text,
                )
            )

        invitation.participant.survey_count += 1
        await self.session.commit()
        await self.session.refresh(survey_response)
        return SurveySubmissionResponse(
            response_id=survey_response.id,
            submitted_at=survey_response.submitted_at,
            message="Survey submitted successfully",
        )
