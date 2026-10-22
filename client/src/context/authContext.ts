import { createContext } from "react";
import type { AuthSession, LoginInput } from "../types/auth";

export interface AuthContextValue {
    session: AuthSession | null;
    login: (input: LoginInput) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
