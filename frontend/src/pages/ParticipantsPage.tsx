import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { Activity, Plus, UserCheck2, Users2 } from "lucide-react";

import { apiFetch } from "../api/client";
import type { Participant } from "../api/types";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { useAuth } from "../features/auth/AuthProvider";

export function ParticipantsPage() {
  const { token, logout } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const successMessage =
    typeof location.state === "object" && location.state && "successMessage" in location.state
      ? location.state.successMessage
      : null;

  const participantsQuery = useQuery({
    queryKey: ["participants"],
    queryFn: () => apiFetch<Participant[]>("/api/participants", { token }),
  });

  const toggleMutation = useMutation({
    mutationFn: (participant: Participant) =>
      apiFetch<Participant>(`/api/participants/${participant.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ is_active: !participant.is_active }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["participants"] }),
    onError: (error) => {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        logout();
      }
    },
  });

  const participantStats = useMemo(() => {
    const participants = participantsQuery.data ?? [];
    const activeCount = participants.filter((participant) => participant.is_active).length;
    const invitedCount = participants.filter((participant) => participant.survey_count > 0).length;

    return {
      total: participants.length,
      active: activeCount,
      engaged: invitedCount,
    };
  }, [participantsQuery.data]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Participant Operations</p>
          <h1 className="text-2xl font-semibold">Participants</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Keep your mailing list clean, track who is active, and make sure only the right people receive survey invitations.
          </p>
        </div>
        <Link to="/participants/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Participant
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="stat-card">
          <Users2 className="h-5 w-5 text-blue-600" />
          <div className="stat-value">{participantStats.total}</div>
          <p className="stat-label">Total participants currently in the system.</p>
        </article>
        <article className="stat-card">
          <UserCheck2 className="h-5 w-5 text-emerald-600" />
          <div className="stat-value">{participantStats.active}</div>
          <p className="stat-label">Active participants eligible for invitations.</p>
        </article>
        <article className="stat-card">
          <Activity className="h-5 w-5 text-sky-600" />
          <div className="stat-value">{participantStats.engaged}</div>
          <p className="stat-label">Participants who have already received at least one survey.</p>
        </article>
      </div>

      {typeof successMessage === "string" && <div className="notice-success">{successMessage}</div>}

      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Participant Directory</h2>
            <p className="mt-1 text-sm text-muted">Review contact records, delivery eligibility, and survey activity.</p>
          </div>
          <span className="chip-muted">{participantStats.total} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-slate-50/80 text-left text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Participant</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Survey Activity</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {participantsQuery.data?.map((participant) => (
                <tr key={participant.id} className="align-middle">
                  <td className="px-5 py-4">
                    <div className="font-medium text-ink">{participant.full_name}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{participant.email}</td>
                  <td className="px-5 py-4 text-slate-600">{participant.mobile}</td>
                  <td className="px-5 py-4">
                    <span className="chip-muted">{participant.survey_count} surveys</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={participant.is_active ? "chip-success" : "chip-muted"}>
                        {participant.is_active ? "Active" : "Inactive"}
                      </span>
                      <Checkbox
                        checked={participant.is_active}
                        onChange={() => toggleMutation.mutate(participant)}
                        aria-label={`Toggle ${participant.full_name}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {participantsQuery.isLoading && <div className="px-5 py-6 text-sm text-muted">Loading participants...</div>}
        {participantsQuery.error && (
          <div className="px-5 py-6 text-sm text-danger">
            {participantsQuery.error instanceof Error ? participantsQuery.error.message : "Failed to load participants"}
          </div>
        )}
      </div>
    </section>
  );
}

