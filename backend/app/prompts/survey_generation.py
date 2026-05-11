import json

from backend.app.schemas.survey import QuestionRegenerateRequest, SurveyGenerateRequest

SURVEY_GENERATION_SYSTEM_PROMPT = (
    "You are generating survey content for an admin-facing survey platform. "
    "Return only valid JSON that matches the provided schema exactly. "
    "Do not include markdown, explanations, code fences, labels, or extra keys. "
    "Make the survey content clear, concise, and ready for human review and editing."
)

SURVEY_GENERATION_RETRY_SUFFIX = (
    "\nThe previous response did not satisfy the required format. "
    "Retry and return strict JSON only. "
    "Follow the schema exactly, include all required fields, and do not add any extra text."
)


def build_survey_response_schema(question_count: int, option_count: int) -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["title", "questions"],
        "properties": {
            "title": {"type": "string"},
            "questions": {
                "type": "array",
                "minItems": question_count,
                "maxItems": question_count,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": ["question", "options", "correct_answer_index"],
                    "properties": {
                        "question": {"type": "string"},
                        "options": {
                            "type": "array",
                            "minItems": option_count,
                            "maxItems": option_count,
                            "items": {"type": "string"},
                        },
                        "correct_answer_index": {
                            "type": "integer",
                            "minimum": 0,
                            "maximum": option_count - 1,
                        },
                    },
                },
            },
        },
    }


def build_generate_survey_prompt(payload: SurveyGenerateRequest) -> str:
    return (
        "Create survey content for the topic below.\n\n"
        f"Topic: {payload.topic}\n\n"
        "Requirements:\n"
        f"- Return exactly {payload.question_count} questions.\n"
        f"- Return exactly {payload.option_count} options for each question.\n"
        "- Generate a concise, professional survey title.\n"
        "- Each question must be clear, grammatically correct, and unambiguous.\n"
        "- Each set of options must be distinct and plausible.\n"
        "- Each question must have exactly one clearly correct answer.\n"
        "- Avoid duplicate or near-duplicate questions.\n"
        "- Avoid empty, vague, or overly broad wording.\n"
        "- The output must be suitable for an admin to review and edit before saving.\n"
    )


def build_regenerate_question_prompt(payload: QuestionRegenerateRequest) -> str:
    existing_questions = [
        {
            "question": question.question,
            "options": question.options,
            "correct_answer_index": question.correct_answer_index,
        }
        for question in payload.questions
    ]
    return (
        "Regenerate one survey question for an existing draft.\n\n"
        f"Survey topic: {payload.topic}\n"
        f"Survey title: {payload.title}\n"
        f"Target question index to replace: {payload.target_index}\n\n"
        "Requirements:\n"
        "- Generate a replacement for the target question only.\n"
        "- Return exactly 1 question.\n"
        f"- Return exactly {payload.option_count} options.\n"
        "- The question must fit the survey topic and title.\n"
        "- The question must be distinct from the existing sibling questions.\n"
        "- Do not duplicate or closely paraphrase any existing question.\n"
        "- Include exactly one clearly correct answer.\n"
        "- Keep the wording professional, concise, and editable.\n\n"
        f"Existing questions: {json.dumps(existing_questions)}"
    )
