import type { CreateTicketInput, PublicTicket, UpdateTicketInput } from "../types/ticket";
import type { DeletedTicketResult } from "../types/api";
import { isDeletedTicketResult, isPublicTicket, isPublicTicketArray } from "../types/guards";
import { request } from "./http";

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
