import type { ApiResponse, DeletedTicketResult } from "./api";
import type { AuthSession } from "./auth";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "./ticket";
import type { PublicTicket, TicketCategory, TicketPriority, TicketStatus } from "./ticket";

// Everything that comes from the server or from storage is `unknown` until one of these guards checks it

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isTicketCategory(value: unknown): value is TicketCategory {
    return TICKET_CATEGORIES.some((category: TicketCategory) => category === value);
}

export function isTicketPriority(value: unknown): value is TicketPriority {
    return TICKET_PRIORITIES.some((priority: TicketPriority) => priority === value);
}

export function isTicketStatus(value: unknown): value is TicketStatus {
    return TICKET_STATUSES.some((status: TicketStatus) => status === value);
}

export function isPublicTicket(value: unknown): value is PublicTicket {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.fullName === "string" &&
        typeof value.email === "string" &&
        typeof value.phone === "string" &&
        typeof value.title === "string" &&
        typeof value.description === "string" &&
        isTicketCategory(value.category) &&
        isTicketPriority(value.priority) &&
        isTicketStatus(value.status) &&
        typeof value.createdAt === "string" &&
        typeof value.updatedAt === "string"
    );
}

export function isPublicTicketArray(value: unknown): value is PublicTicket[] {
    return Array.isArray(value) && value.every(isPublicTicket);
}

export function isDeletedTicketResult(value: unknown): value is DeletedTicketResult {
    return isRecord(value) && typeof value.id === "string";
}

export function isAuthSession(value: unknown): value is AuthSession {
    return isRecord(value) && typeof value.token === "string" && typeof value.username === "string" && typeof value.expiresAt === "string";
}

// Checks the envelope of a server answer; the payload itself is checked with `isData`
export function isApiResponse<T>(value: unknown, isData: (data: unknown) => data is T): value is ApiResponse<T> {
    if (!isRecord(value)) {
        return false;
    }
    if (value.success === true) {
        return isData(value.data);
    }
    return value.success === false && typeof value.error === "string";
}
