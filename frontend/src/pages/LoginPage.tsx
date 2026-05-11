import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { FormError } from "../components/ui/FormError";
import { Input } from "../components/ui/Input";
import { useAuth } from "../features/auth/AuthProvider";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      setError("");
      await login(values);
      navigate(location.state?.from?.pathname ?? "/participants", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel-muted hidden p-10 lg:block">
          <p className="eyebrow">Survey Operations</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight text-ink">
            Run participant-driven surveys with a calm, production-ready workspace.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Manage participant records, generate AI-assisted surveys, and coordinate invitations without switching tools.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="panel bg-white/75 p-5">
              <div className="text-sm font-semibold text-ink">Participant controls</div>
              <p className="mt-2 text-sm leading-6 text-muted">Track activation status, protect delivery lists, and keep records tidy.</p>
            </div>
            <div className="panel bg-white/75 p-5">
              <div className="text-sm font-semibold text-ink">AI authoring</div>
              <p className="mt-2 text-sm leading-6 text-muted">Generate structured drafts that can still be reviewed and edited by an admin.</p>
            </div>
          </div>
        </section>
        <div className="panel w-full p-8 lg:p-10">
          <div className="mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200/60">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Admin Login</h2>
            <p className="mt-2 text-sm text-muted">Use the admin account created by the backend bootstrap script.</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="label">Email</label>
              <Input type="email" placeholder="admin@example.com" {...register("email")} />
              <FormError message={errors.email?.message} />
            </div>
            <div>
              <label className="label">Password</label>
              <Input type="password" placeholder="Enter your password" {...register("password")} />
              <FormError message={errors.password?.message} />
            </div>
            <FormError message={error} />
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in..." : "Login to Workspace"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

