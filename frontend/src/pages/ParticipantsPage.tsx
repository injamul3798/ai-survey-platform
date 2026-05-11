import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { apiFetch } from "../api/client";
import type { Participant } from "../api/types";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { useAuth } from "../features/auth/AuthProvider";

export function ParticipantsPage() {
  const { token, logout } = useAuth();
  const queryClient = useQueryClient();

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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Participants</h1>
          <p className="mt-1 text-sm text-muted">Active participants receive survey invitations.</p>
        </div>
        <Link to="/participants/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Participant
          </Button>
        </Link>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-slate-50 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Full Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Mobile</th>
                <th className="px-4 py-3 font-medium">Survey Count</th>
                <th className="px-4 py-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {participantsQuery.data?.map((participant) => (
                <tr key={participant.id}>
                  <td className="px-4 py-3">{participant.full_name}</td>
                  <td className="px-4 py-3">{participant.email}</td>
                  <td className="px-4 py-3">{participant.mobile}</td>
                  <td className="px-4 py-3">{participant.survey_count}</td>
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={participant.is_active}
                      onChange={() => toggleMutation.mutate(participant)}
                      aria-label={`Toggle ${participant.full_name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {participantsQuery.isLoading && <div className="px-4 py-6 text-sm text-muted">Loading participants...</div>}
        {participantsQuery.error && (
          <div className="px-4 py-6 text-sm text-danger">
            {participantsQuery.error instanceof Error ? participantsQuery.error.message : "Failed to load participants"}
          </div>
        )}
      </div>
    </section>
  );
}

