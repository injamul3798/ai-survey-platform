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
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="panel w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="mt-2 text-sm text-muted">Use the admin account created by the backend bootstrap script.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label">Email</label>
            <Input type="email" {...register("email")} />
            <FormError message={errors.email?.message} />
          </div>
          <div>
            <label className="label">Password</label>
            <Input type="password" {...register("password")} />
            <FormError message={errors.password?.message} />
          </div>
          <FormError message={error} />
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

