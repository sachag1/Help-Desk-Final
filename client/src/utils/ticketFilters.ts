import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "../types/ticket";
import type { PublicTicket, TicketCategory, TicketPriority, TicketStatus } from "../types/ticket";

export type StatusFilter = "All" | TicketStatus;
export type PriorityFilter = "All" | TicketPriority;
export type CategoryFilter = "All" | TicketCategory;

export const STATUS_FILTER_OPTIONS: readonly StatusFilter[] = ["All", ...TICKET_STATUSES];
export const PRIORITY_FILTER_OPTIONS: readonly PriorityFilter[] = ["All", ...TICKET_PRIORITIES];
export const CATEGORY_FILTER_OPTIONS: readonly CategoryFilter[] = ["All", ...TICKET_CATEGORIES];

export interface TicketFilters {
    search: string;
    status: StatusFilter;
    priority: PriorityFilter;
    category: CategoryFilter;
}

export const DEFAULT_FILTERS: TicketFilters = { search: "", status: "All", priority: "All", category: "All" };

export function hasActiveFilters(filters: TicketFilters): boolean {
    return (
        filters.search.trim() !== "" || filters.status !== "All" || filters.priority !== "All" || filters.category !== "All"
    );
}

function matchesSearch(ticket: PublicTicket, search: string): boolean {
    const needle: string = search.trim().toLowerCase();
    if (needle === "") {
        return true;
    }
    return [ticket.title, ticket.fullName, ticket.email].some((field: string) => field.toLowerCase().includes(needle));
}

// A ticket is shown only when it matches the search and every selected filter
export function filterTickets(tickets: PublicTicket[], filters: TicketFilters): PublicTicket[] {
    return tickets.filter(
        (ticket: PublicTicket) =>
            matchesSearch(ticket, filters.search) &&
            (filters.status === "All" || ticket.status === filters.status) &&
            (filters.priority === "All" || ticket.priority === filters.priority) &&
            (filters.category === "All" || ticket.category === filters.category)
    );
}
