import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../api/client";
import type { ParticipantPayload, Participant } from "../api/types";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { FormError } from "../components/ui/FormError";
import { Input } from "../components/ui/Input";
import { useAuth } from "../features/auth/AuthProvider";

const schema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  mobile: z.string().min(1, "Mobile is required"),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ParticipantCreatePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", mobile: "", is_active: true },
  });

  const mutation = useMutation({
    mutationFn: (payload: ParticipantPayload) =>
      apiFetch<Participant>("/api/participants", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["participants"] });
      reset();
      navigate("/participants");
    },
  });

  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Participant</h1>
        <p className="mt-1 text-sm text-muted">Create a participant record with unique email validation.</p>
      </div>

      <form className="panel p-6" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="label">Full Name</label>
            <Input {...register("full_name")} />
            <FormError message={errors.full_name?.message} />
          </div>
          <div>
            <label className="label">Email</label>
            <Input type="email" {...register("email")} />
            <FormError message={errors.email?.message} />
          </div>
          <div>
            <label className="label">Mobile</label>
            <Input {...register("mobile")} />
            <FormError message={errors.mobile?.message} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 text-sm font-medium text-ink">
              <Checkbox {...register("is_active")} />
              Active participant
            </label>
          </div>
        </div>
        {mutation.error && (
          <div className="mt-4 text-sm text-danger">
            {mutation.error instanceof Error ? mutation.error.message : "Failed to save participant"}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" onClick={() => reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </section>
  );
}

