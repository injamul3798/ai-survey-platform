from backend.app.schemas.survey import GeneratedSurveyDraft, SurveyCreateRequest


def test_generated_survey_draft_validates_correct_answer_index() -> None:
    payload = {
        "title": "Network Security Basics",
        "questions": [
            {
                "question": "Which protocol encrypts browser traffic?",
                "options": ["HTTP", "HTTPS", "FTP", "SMTP"],
                "correct_answer_index": 1,
            }
        ],
    }
    draft = GeneratedSurveyDraft.model_validate(payload)
    assert draft.questions[0].correct_answer_index == 1


def test_survey_create_request_requires_one_correct_answer() -> None:
    payload = {
        "title": "Cloud Basics",
        "topic": "cloud",
        "question_count": 1,
        "option_count": 2,
        "ai_response": {
            "title": "Cloud Basics",
            "questions": [
                {"question": "What is IaaS?", "options": ["A", "B"], "correct_answer_index": 0}
            ],
        },
        "questions": [
            {
                "question_text": "What is IaaS?",
                "options": [
                    {"option_text": "A", "is_correct": False},
                    {"option_text": "B", "is_correct": False},
                ],
            }
        ],
    }
    try:
        SurveyCreateRequest.model_validate(payload)
        assert False, "Expected validation failure"
    except Exception as exc:  # noqa: BLE001
        assert "exactly one correct answer" in str(exc)

