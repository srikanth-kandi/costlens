import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession, AuthUser } from "@costlens/shared";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  setStoredAuthSession,
} from "./storage";
import {
  AuthContext,
  type AuthContextValue,
  type LoginInput,
} from "./AuthContextObject";

function buildUserFromEmail(email: string, explicitName?: string): AuthUser {
  const fallbackName = email.split("@")[0]?.replace(/[._-]/g, " ") ?? "User";
  const normalizedName =
    explicitName?.trim() ||
    fallbackName
      .split(" ")
      .map((part) =>
        part.length > 0
          ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          : part,
      )
      .join(" ");

  return {
    id: email.toLowerCase(),
    email: email.trim().toLowerCase(),
    name: normalizedName,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = getStoredAuthSession();
    if (stored?.user?.email) {
      setSession(stored);
    }
    setIsReady(true);
  }, []);

  const login = useCallback((input: LoginInput) => {
    const user = buildUserFromEmail(input.email, input.name);
    const nextSession: AuthSession = {
      user,
      rememberMe: Boolean(input.rememberMe),
    };

    setSession(nextSession);

    if (nextSession.rememberMe) {
      setStoredAuthSession(nextSession);
    } else {
      clearStoredAuthSession();
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    clearStoredAuthSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isReady,
      login,
      logout,
    }),
    [session, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
