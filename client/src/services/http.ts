import type { ApiResponse } from "../types/api";
import { isApiResponse } from "../types/guards";

const API_URL: string = import.meta.env.VITE_API_URL;

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
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

function buildInit(options: RequestOptions): RequestInit {
    const headers: Record<string, string> = {};
    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    return {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
    };
}

async function send(path: string, options: RequestOptions): Promise<Response> {
    try {
        return await fetch(`${API_URL}${path}`, buildInit(options));
    } catch {
        throw new ApiRequestError("Cannot reach the server", 0);
    }
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
