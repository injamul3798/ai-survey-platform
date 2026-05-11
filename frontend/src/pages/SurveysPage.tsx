import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Mail, Plus, Send, Sparkles } from "lucide-react";

import { apiFetch } from "../api/client";
import type { SurveyListItem, SurveyResponse } from "../api/types";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthProvider";

export function SurveysPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [invitationMessage, setInvitationMessage] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const successMessage =
    typeof location.state === "object" && location.state && "successMessage" in location.state
      ? location.state.successMessage
      : null;

  const surveysQuery = useQuery({
    queryKey: ["surveys"],
    queryFn: () => apiFetch<SurveyListItem[]>("/api/surveys", { token }),
  });

  const invitationMutation = useMutation({
    mutationFn: (surveyId: string) =>
      apiFetch<SurveyResponse>(`/api/surveys/${surveyId}/send-invitations`, {
        method: "POST",
        token,
      }),
    onSuccess: async (survey) => {
      setInvitationError(null);
      setInvitationMessage(`Invitations were processed for "${survey.title}". Active participants have now been queued for delivery.`);
      await queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
    onError: (error) => {
      setInvitationMessage(null);
      setInvitationError(error instanceof Error ? error.message : "Failed to send invitations");
    },
  });

  const surveyStats = useMemo(() => {
    const surveys = surveysQuery.data ?? [];
    const totalInvitations = surveys.reduce((sum, survey) => sum + survey.sent_invitation_count, 0);
    const totalQuestions = surveys.reduce((sum, survey) => sum + survey.question_count, 0);

    return {
      total: surveys.length,
      invitations: totalInvitations,
      averageQuestions: surveys.length ? (totalQuestions / surveys.length).toFixed(1) : "0.0",
    };
  }, [surveysQuery.data]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Survey Workspace</p>
          <h1 className="text-2xl font-semibold">Surveys</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Generate AI-assisted drafts, refine question quality, and manage invitation delivery from a single survey pipeline.
          </p>
        </div>
        <Link to="/surveys/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Survey
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="stat-card">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <div className="stat-value">{surveyStats.total}</div>
          <p className="stat-label">Saved surveys available for invitation and review.</p>
        </article>
        <article className="stat-card">
          <Send className="h-5 w-5 text-emerald-600" />
          <div className="stat-value">{surveyStats.invitations}</div>
          <p className="stat-label">Total invitations already sent across all surveys.</p>
        </article>
        <article className="stat-card">
          <Sparkles className="h-5 w-5 text-sky-600" />
          <div className="stat-value">{surveyStats.averageQuestions}</div>
          <p className="stat-label">Average number of questions per survey draft.</p>
        </article>
      </div>

      {typeof successMessage === "string" && <div className="notice-success">{successMessage}</div>}
      {invitationMessage && <div className="notice-success">{invitationMessage}</div>}
      {invitationError && <div className="notice-error">{invitationError}</div>}

      <div className="grid gap-4">
        {surveysQuery.data?.map((survey) => (
          <article key={survey.id} className="panel overflow-hidden">
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <Link to={`/surveys/${survey.id}`} className="text-xl font-semibold text-ink hover:text-blue-700">
                    {survey.title}
                  </Link>
                  <span className="chip">{survey.question_count} questions</span>
                  <span className="chip-muted">{survey.option_count} options each</span>
                </div>
                <Link to={`/surveys/${survey.id}`} className="mt-3 block max-w-3xl text-sm leading-6 text-muted hover:text-slate-700">
                  {survey.topic}
                </Link>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="chip-success">{survey.active_participant_count} active participants</span>
                  <span className="chip-muted">{survey.sent_invitation_count} invitations sent</span>
                </div>
              </div>
              <div className="panel-muted min-w-[220px] p-4">
                <p className="eyebrow">Distribution</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Send this survey to all currently active participants in the workspace.
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => invitationMutation.mutate(survey.id)}
                  disabled={invitationMutation.isPending}
                >
                  <Mail className="h-4 w-4" />
                  Send Invitations
                </Button>
              </div>
            </div>
          </article>
        ))}
        {surveysQuery.isLoading && <div className="panel p-6 text-sm text-muted">Loading surveys...</div>}
        {surveysQuery.error && (
          <div className="panel p-6 text-sm text-danger">
            {surveysQuery.error instanceof Error ? surveysQuery.error.message : "Failed to load surveys"}
          </div>
        )}
      </div>
    </section>
  );
}

