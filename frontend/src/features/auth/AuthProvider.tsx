import { createContext, useContext, useMemo, useState } from "react";

import { apiFetch } from "../../api/client";
import type { LoginPayload, TokenResponse } from "../../api/types";
import { authStorage } from "./storage";

type AuthContextValue = {
  token: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      async login(payload) {
        const response = await apiFetch<TokenResponse>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        authStorage.setToken(response.access_token);
        setToken(response.access_token);
      },
      logout() {
        authStorage.clearToken();
        setToken(null);
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

