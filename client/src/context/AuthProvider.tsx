import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthSession, LoginInput } from "../types/auth";
import * as authApi from "../services/authApi";
import { clearSession, loadSession, saveSession } from "../services/authStorage";
import { setUnauthorizedHandler } from "../services/http";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<AuthSession | null>(() => loadSession());

    const login = useCallback(async (input: LoginInput): Promise<void> => {
        const next: AuthSession = await authApi.login(input);
        saveSession(next);
        setSession(next);
    }, []);

    const logout = useCallback((): void => {
        clearSession();
        setSession(null);
    }, []);

    // A protected call rejected with 401 (expired or invalid token) ends the local session too
    useEffect(() => {
        setUnauthorizedHandler(logout);
        return () => setUnauthorizedHandler(null);
    }, [logout]);

    const value: AuthContextValue = useMemo(() => ({ session, login, logout }), [session, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
