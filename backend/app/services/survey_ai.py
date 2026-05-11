import json

from openai import AsyncOpenAI
from pydantic import ValidationError as PydanticValidationError

from backend.app.core.config import settings
from backend.app.core.exceptions import AppError, ValidationError
from backend.app.prompts.survey_generation import (
    SURVEY_GENERATION_RETRY_SUFFIX,
    SURVEY_GENERATION_SYSTEM_PROMPT,
    build_generate_survey_prompt,
    build_regenerate_question_prompt,
    build_survey_response_schema,
)
from backend.app.schemas.survey import GeneratedQuestion, GeneratedSurveyDraft, QuestionRegenerateRequest, SurveyGenerateRequest


class SurveyAIService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def generate(self, payload: SurveyGenerateRequest) -> GeneratedSurveyDraft:
        prompt = build_generate_survey_prompt(payload)
        return await self._request_with_retry(prompt, payload.question_count, payload.option_count)

    async def regenerate_question(self, payload: QuestionRegenerateRequest) -> GeneratedSurveyDraft:
        prompt = build_regenerate_question_prompt(payload)
        regenerated = await self._request_with_retry(prompt, 1, payload.option_count)
        questions = list(payload.questions)
        questions[payload.target_index] = GeneratedQuestion.model_validate(regenerated.questions[0].model_dump())
        return GeneratedSurveyDraft(title=payload.title, questions=questions)

    async def _request_with_retry(self, prompt: str, question_count: int, option_count: int) -> GeneratedSurveyDraft:
        last_error: Exception | None = None
        attempts = [
            prompt,
            prompt + SURVEY_GENERATION_RETRY_SUFFIX,
        ]
        for attempt_prompt in attempts:
            try:
                return await self._request_once(attempt_prompt, question_count, option_count)
            except (AppError, PydanticValidationError, ValueError, json.JSONDecodeError) as exc:
                last_error = exc
                continue

        raise ValidationError(f"AI response validation failed after retry: {last_error}")

    async def _request_once(self, prompt: str, question_count: int, option_count: int) -> GeneratedSurveyDraft:
        response = await self.client.responses.create(
            model=settings.openai_model,
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": SURVEY_GENERATION_SYSTEM_PROMPT,
                        }
                    ],
                },
                {"role": "user", "content": [{"type": "input_text", "text": prompt}]},
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "survey_generation",
                    "strict": True,
                    "schema": build_survey_response_schema(question_count, option_count),
                }
            },
        )

        raw_text = getattr(response, "output_text", "")
        if not raw_text:
            raise ValidationError("AI returned an empty response")

        parsed = json.loads(raw_text)
        draft = GeneratedSurveyDraft.model_validate(parsed)
        if len(draft.questions) != question_count:
            raise ValueError("Generated question count does not match request")
        if any(len(question.options) != option_count for question in draft.questions):
            raise ValueError("Generated option count does not match request")
        if not draft.title.strip():
            raise ValueError("Generated title cannot be blank")
        return draft
