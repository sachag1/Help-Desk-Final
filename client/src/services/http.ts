import type { ApiResponse } from "../types/api";
import { isApiResponse } from "../types/guards";
import { loadSession } from "./authStorage";

const API_URL: string = import.meta.env.VITE_API_URL;

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    // Protected endpoints send the administrator token; public ones (ticket creation, login) do not need it
    authenticated?: boolean;
}

// Error thrown by the API layer; `status` is 0 when the server could not be reached
export class ApiRequestError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
    }
}

const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

let unauthorizedHandler: (() => void) | null = null;

// The authentication provider registers what must happen when the server answers 401 to a protected call
export function setUnauthorizedHandler(handler: (() => void) | null): void {
    unauthorizedHandler = handler;
}

function buildInit(options: RequestOptions): RequestInit {
    const headers: Record<string, string> = {};
    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    if (options.authenticated ?? true) {
        const token: string | undefined = loadSession()?.token;
        if (token !== undefined) {
            headers.Authorization = `Bearer ${token}`;
        }
    }
    return {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
    };
}

export async function send(path: string, options: RequestOptions): Promise<Response> {
    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`, buildInit(options));
    } catch {
        throw new ApiRequestError("Cannot reach the server", 0);
    }
    if (response.status === 401 && (options.authenticated ?? true) && unauthorizedHandler !== null) {
        unauthorizedHandler();
        throw new ApiRequestError(SESSION_EXPIRED_MESSAGE, 401);
    }
    return response;
}

// The one place that calls fetch for JSON endpoints. The answer is `unknown` until it is checked.
export async function request<T>(path: string, isData: (data: unknown) => data is T, options: RequestOptions = {}): Promise<T> {
    const response: Response = await send(path, options);

    let body: unknown;
    try {
        body = await response.json();
    } catch {
        throw new ApiRequestError("The server returned an invalid response", response.status);
    }

    if (!isApiResponse<T>(body, isData)) {
        throw new ApiRequestError("The server returned an unexpected response", response.status);
    }

    const result: ApiResponse<T> = body;
    if (!result.success) {
        throw new ApiRequestError(result.error, response.status);
    }
    return result.data;
}
