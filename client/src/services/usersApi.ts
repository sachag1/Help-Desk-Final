import type { ApiResponse } from "../types/api";
import type { CreateUserInput, PublicUser } from "../types/user";
import { isApiResponse, isDeletedId, isPublicUser, isPublicUserArray } from "../types/guards";

const API_URL: string = import.meta.env.VITE_API_URL;

async function sendRequest<T>(path: string, isData: (data: unknown) => data is T, options?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`, options);
    } catch {
        throw new Error("Cannot reach the server");
    }

    // The answer comes from outside the app, so it is `unknown` until it is checked
    let body: unknown;
    try {
        body = await response.json();
    } catch {
        throw new Error("The server returned an invalid response");
    }

    if (!isApiResponse<T>(body, isData)) {
        throw new Error("The server returned an unexpected response");
    }

    const result: ApiResponse<T> = body;
    if (!result.success) {
        throw new Error(result.error);
    }

    return result.data;
}

export async function getUsers(): Promise<PublicUser[]> {
    return sendRequest<PublicUser[]>("/users", isPublicUserArray);
}

export async function getUserById(id: string): Promise<PublicUser> {
    return sendRequest<PublicUser>(`/users/${encodeURIComponent(id)}`, isPublicUser);
}

export async function createUser(user: CreateUserInput): Promise<PublicUser> {
    return sendRequest<PublicUser>("/users", isPublicUser, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
}

export async function deleteUser(id: string): Promise<void> {
    await sendRequest<{ id: string }>(`/users/${encodeURIComponent(id)}`, isDeletedId, { method: "DELETE" });
}
