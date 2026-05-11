import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import { apiFetch } from "../api/client";
import type { InvitationDetail } from "../api/types";
import { Button } from "../components/ui/Button";

type SubmissionValues = {
  answers: Record<string, string>;
};

export function SurveySubmissionPage() {
  const { token = "" } = useParams();
  const invitationQuery = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => apiFetch<InvitationDetail>(`/api/public/invitations/${token}`),
  });

  const form = useForm<SubmissionValues>({ defaultValues: { answers: {} } });

  const submitMutation = useMutation({
    mutationFn: (values: SubmissionValues) =>
      apiFetch<{ message: string }>(`/api/public/invitations/${token}/submit`, {
        method: "POST",
        body: JSON.stringify({
          answers: Object.entries(values.answers).map(([question_id, selected_option_id]) => ({
            question_id,
            selected_option_id,
          })),
        }),
      }),
  });

  function handleCancel() {
    form.reset({ answers: {} });
  }

  const detail = invitationQuery.data;

  return (
    <div className="min-h-screen bg-surface px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="panel p-6">
          <h1 className="text-2xl font-semibold">{detail?.survey_title ?? "Survey"}</h1>
          <p className="mt-2 text-sm text-muted">
            {detail ? `Participant: ${detail.participant_name}` : "Loading survey invitation..."}
          </p>
        </header>

        {detail?.answered ? (
          <div className="panel p-6 text-sm text-warning">This survey has already been submitted.</div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            if (!detail) return;
            if (Object.keys(values.answers).length !== detail.questions.length) {
              form.setError("answers", { message: "All questions must be answered" });
              return;
            }
            submitMutation.mutate(values);
          })}
        >
          {detail?.questions.map((question) => (
            <section key={question.id} className="panel p-6">
              <h2 className="text-lg font-semibold">
                {question.question_order + 1}. {question.question_text}
              </h2>
              <div className="mt-4 grid gap-3">
                {question.options.map((option) => (
                  <label key={option.id} className="flex items-start gap-3 rounded-md border border-line p-3">
                    <input
                      type="radio"
                      value={option.id}
                      {...form.register(`answers.${question.id}`)}
                      className="mt-1"
                    />
                    <span className="text-sm">{option.option_text}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}

          {form.formState.errors.answers?.message && (
            <div className="text-sm text-danger">{form.formState.errors.answers.message}</div>
          )}
          {submitMutation.error && (
            <div className="text-sm text-danger">
              {submitMutation.error instanceof Error ? submitMutation.error.message : "Submission failed"}
            </div>
          )}
          {submitMutation.isSuccess && <div className="text-sm text-success">Survey submitted successfully.</div>}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitMutation.isPending || detail?.answered}>
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

