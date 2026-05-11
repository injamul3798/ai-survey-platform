import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Mail, Plus } from "lucide-react";

import { apiFetch } from "../api/client";
import type { SurveyListItem, SurveyResponse } from "../api/types";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthProvider";

export function SurveysPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["surveys"] }),
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Surveys</h1>
          <p className="mt-1 text-sm text-muted">Manage generated surveys and send invitations to active participants.</p>
        </div>
        <Link to="/surveys/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Survey
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {surveysQuery.data?.map((survey) => (
          <article key={survey.id} className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{survey.title}</h2>
                <p className="text-sm text-muted">{survey.topic}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted">
                  <span>{survey.question_count} questions</span>
                  <span>{survey.option_count} options each</span>
                  <span>{survey.active_participant_count} active participants</span>
                  <span>{survey.sent_invitation_count} invitations sent</span>
                </div>
              </div>
              <Button onClick={() => invitationMutation.mutate(survey.id)} disabled={invitationMutation.isPending}>
                <Mail className="h-4 w-4" />
                Send Invitations
              </Button>
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

