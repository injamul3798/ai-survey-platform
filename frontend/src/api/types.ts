export type LoginPayload = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type Participant = {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  is_active: boolean;
  survey_count: number;
  created_at: string;
  updated_at: string;
};

export type ParticipantPayload = {
  full_name: string;
  email: string;
  mobile: string;
  is_active: boolean;
};

export type GeneratedQuestion = {
  question: string;
  options: string[];
  correct_answer_index: number;
};

export type GeneratedSurveyDraft = {
  title: string;
  questions: GeneratedQuestion[];
};

export type SurveyListItem = {
  id: string;
  title: string;
  topic: string;
  question_count: number;
  option_count: number;
  created_at: string;
  active_participant_count: number;
  sent_invitation_count: number;
};

export type SurveyQuestionOption = {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_order: number;
  created_at: string;
  updated_at: string;
};

export type SurveyQuestion = {
  id: string;
  survey_id: string;
  question_text: string;
  question_order: number;
  created_at: string;
  updated_at: string;
  options: SurveyQuestionOption[];
};

export type SurveyResponse = {
  id: string;
  title: string;
  topic: string;
  question_count: number;
  option_count: number;
  ai_response: GeneratedSurveyDraft;
  created_at: string;
  updated_at: string;
  active_participant_count: number;
  sent_invitation_count: number;
  questions: SurveyQuestion[];
};

export type InvitationDetail = {
  survey_id: string;
  survey_title: string;
  participant_name: string;
  answered: boolean;
  questions: {
    id: string;
    question_text: string;
    question_order: number;
    options: { id: string; option_text: string; option_order: number }[];
  }[];
};

