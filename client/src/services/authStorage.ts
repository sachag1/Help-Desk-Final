import type { AuthSession } from "../types/auth";
import { isAuthSession } from "../types/guards";

const STORAGE_KEY = "helpdesk.session";

// The login state lives in sessionStorage: it disappears when the tab is closed and on logout
export function loadSession(): AuthSession | null {
    try {
        const raw: string | null = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return null;
        }
        const parsed: unknown = JSON.parse(raw);
        if (!isAuthSession(parsed) || Date.parse(parsed.expiresAt) <= Date.now()) {
            window.sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function saveSession(session: AuthSession): void {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
        // Storage can be unavailable (private mode): the session then only lives in memory
    }
}

export function clearSession(): void {
    try {
        window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // nothing to remove
    }
}
