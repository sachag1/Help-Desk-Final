import type { AuthSession, LoginInput } from "../types/auth";
import { isAuthSession } from "../types/guards";
import { request } from "./http";

// A wrong login answers 401 with a generic message; that is not an expired session
export async function login(input: LoginInput): Promise<AuthSession> {
    return request<AuthSession>("/admin/login", isAuthSession, { method: "POST", body: input, authenticated: false });
}
