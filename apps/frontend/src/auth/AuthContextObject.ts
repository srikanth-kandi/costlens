import { createContext } from "react";
import type { AuthUser } from "@costlens/shared";

export type LoginInput = {
  email: string;
  name?: string;
  rememberMe?: boolean;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (input: LoginInput) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
