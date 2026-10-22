import type { ApiResponse } from "./api";
import type { PublicUser } from "./user";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPublicUser(value: unknown): value is PublicUser {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        typeof value.lastName === "string" &&
        typeof value.email === "string" &&
        typeof value.userName === "string"
    );
}

export function isPublicUserArray(value: unknown): value is PublicUser[] {
    return Array.isArray(value) && value.every(isPublicUser);
}

export function isDeletedId(value: unknown): value is { id: string } {
    return isRecord(value) && typeof value.id === "string";
}

// Checks the envelope of a server answer; the payload is validated with `isData`
export function isApiResponse<T>(value: unknown, isData: (data: unknown) => data is T): value is ApiResponse<T> {
    if (!isRecord(value)) {
        return false;
    }
    if (value.success === true) {
        return isData(value.data);
    }
    return value.success === false && typeof value.error === "string";
}
