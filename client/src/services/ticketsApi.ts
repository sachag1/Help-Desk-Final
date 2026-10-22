import type { CreateTicketInput, PublicTicket, UpdateTicketInput } from "../types/ticket";
import type { DeletedTicketResult } from "../types/api";
import { isDeletedTicketResult, isPublicTicket, isPublicTicketArray, isRecord } from "../types/guards";
import { ApiRequestError, request, send } from "./http";

export async function createTicket(input: CreateTicketInput): Promise<PublicTicket> {
    return request<PublicTicket>("/tickets", isPublicTicket, { method: "POST", body: input });
}

export async function getTickets(): Promise<PublicTicket[]> {
    return request<PublicTicket[]>("/tickets", isPublicTicketArray);
}

export async function getTicketById(id: string): Promise<PublicTicket> {
    return request<PublicTicket>(`/tickets/${encodeURIComponent(id)}`, isPublicTicket);
}

export async function updateTicket(id: string, update: UpdateTicketInput): Promise<PublicTicket> {
    return request<PublicTicket>(`/tickets/${encodeURIComponent(id)}`, isPublicTicket, { method: "PATCH", body: update });
}

export async function deleteTicket(id: string): Promise<void> {
    await request<DeletedTicketResult>(`/tickets/${encodeURIComponent(id)}`, isDeletedTicketResult, { method: "DELETE" });
}

export interface CsvFile {
    blob: Blob;
    filename: string;
}

const DEFAULT_CSV_FILENAME = "tickets.csv";

function readFilename(contentDisposition: string | null): string {
    const match: RegExpMatchArray | null = contentDisposition === null ? null : contentDisposition.match(/filename="?([^";]+)"?/i);
    return match !== null ? match[1] : DEFAULT_CSV_FILENAME;
}

// The CSV is a file, not a JSON answer, so it does not go through the JSON request function
export async function exportTicketsCsv(): Promise<CsvFile> {
    const response: Response = await send("/tickets/export/csv", {});

    if (!response.ok) {
        let message = `The export failed (status ${response.status})`;
        try {
            const body: unknown = await response.json();
            if (isRecord(body) && typeof body.error === "string") {
                message = body.error;
            }
        } catch {
            // keep the generic message
        }
        throw new ApiRequestError(message, response.status);
    }

    return { blob: await response.blob(), filename: readFilename(response.headers.get("Content-Disposition")) };
}
