import {
    CreateTicketInput,
    TICKET_CATEGORIES,
    TICKET_PRIORITIES,
    TICKET_STATUSES,
    TicketCategory,
    TicketPriority,
    TicketStatus,
    UpdateTicketInput
} from "../type/ticket";

export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS: RegExp = /^[\d\s\-()+]+$/;

export function isTicketCategory(value: unknown): value is TicketCategory {
    return TICKET_CATEGORIES.some((category: TicketCategory) => category === value);
}

export function isTicketPriority(value: unknown): value is TicketPriority {
    return TICKET_PRIORITIES.some((priority: TicketPriority) => priority === value);
}

export function isTicketStatus(value: unknown): value is TicketStatus {
    return TICKET_STATUSES.some((status: TicketStatus) => status === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Returns the trimmed text when it is a string whose length is within [min, max], otherwise null
function readText(value: unknown, min: number, max: number): string | null {
    if (typeof value !== "string") {
        return null;
    }
    const trimmed: string = value.trim();
    return trimmed.length >= min && trimmed.length <= max ? trimmed : null;
}

function readPhone(value: unknown): string | null {
    const text: string | null = readText(value, 7, 30);
    if (text === null || !PHONE_CHARACTERS.test(text)) {
        return null;
    }
    const digits: number = text.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15 ? text : null;
}

function readEmail(value: unknown): string | null {
    const text: string | null = readText(value, 5, 254);
    return text !== null && EMAIL_PATTERN.test(text) ? text : null;
}

export function parseCreateTicketInput(body: unknown): ParseResult<CreateTicketInput> {
    if (!isRecord(body)) {
        return { ok: false, errors: ["The request body must be a JSON object"] };
    }

    const errors: string[] = [];
    const fullName: string | null = readText(body.fullName, 2, 100);
    const email: string | null = readEmail(body.email);
    const phone: string | null = readPhone(body.phone);
    const title: string | null = readText(body.title, 3, 120);
    const description: string | null = readText(body.description, 10, 2000);
    const category: unknown = body.category;
    const priority: unknown = body.priority;

    if (fullName === null) errors.push("fullName is required (2-100 characters)");
    if (email === null) errors.push("email must be a valid email address");
    if (phone === null) errors.push("phone must be a valid phone number");
    if (title === null) errors.push("title is required (3-120 characters)");
    if (description === null) errors.push("description is required (10-2000 characters)");
    if (!isTicketCategory(category)) errors.push(`category must be one of: ${TICKET_CATEGORIES.join(", ")}`);
    if (!isTicketPriority(priority)) errors.push(`priority must be one of: ${TICKET_PRIORITIES.join(", ")}`);
    // The status is never chosen by the customer, but a bad value is still a bad request
    if (body.status !== undefined && !isTicketStatus(body.status)) {
        errors.push(`status must be one of: ${TICKET_STATUSES.join(", ")}`);
    }

    if (
        errors.length > 0 ||
        fullName === null ||
        email === null ||
        phone === null ||
        title === null ||
        description === null ||
        !isTicketCategory(category) ||
        !isTicketPriority(priority)
    ) {
        return { ok: false, errors };
    }

    return { ok: true, value: { fullName, email, phone, title, description, category, priority } };
}
