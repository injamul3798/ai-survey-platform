import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { apiFetch } from "../api/client";
import type { SurveyResponse } from "../api/types";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthProvider";

export function SurveyDetailPage() {
  const { token } = useAuth();
  const { surveyId = "" } = useParams();

  const surveyQuery = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: () => apiFetch<SurveyResponse>(`/api/surveys/${surveyId}`, { token }),
    enabled: Boolean(surveyId),
  });

  const survey = surveyQuery.data;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">Survey Detail</p>
          <h1 className="text-2xl font-semibold">{survey?.title ?? "Survey"}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {survey?.topic ?? "Review the full question set, correct answers, and delivery readiness for this survey."}
          </p>
        </div>
        <Link to="/surveys">
          <Button variant="secondary">
            <ChevronLeft className="h-4 w-4" />
            Back to Surveys
          </Button>
        </Link>
      </div>

      {surveyQuery.isLoading && <div className="panel p-6 text-sm text-muted">Loading survey details...</div>}

      {surveyQuery.error && (
        <div className="notice-error">
          {surveyQuery.error instanceof Error ? surveyQuery.error.message : "Failed to load survey details"}
        </div>
      )}

      {survey && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="stat-card">
              <div className="stat-value">{survey.question_count}</div>
              <p className="stat-label">Questions in this survey.</p>
            </article>
            <article className="stat-card">
              <div className="stat-value">{survey.option_count}</div>
              <p className="stat-label">Options configured per question.</p>
            </article>
            <article className="stat-card">
              <div className="stat-value">{survey.sent_invitation_count}</div>
              <p className="stat-label">Invitations already sent.</p>
            </article>
          </div>

          <div className="space-y-4">
            {survey.questions.map((question) => (
              <article key={question.id} className="panel p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-ink">Question {question.question_order + 1}</h2>
                  <span className="chip-muted">{question.options.length} options</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{question.question_text}</p>
                <div className="mt-5 grid gap-3">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`rounded-2xl border px-4 py-3 text-sm ${
                        option.is_correct
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-line bg-white text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{option.option_text}</span>
                        {option.is_correct ? <span className="chip-success">Correct answer</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
