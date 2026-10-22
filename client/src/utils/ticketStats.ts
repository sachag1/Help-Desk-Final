import type { PublicTicket } from "../types/ticket";

export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    highPriority: number;
}

// The counters are computed from the tickets already loaded in the client
export function computeTicketStats(tickets: PublicTicket[]): TicketStats {
    return {
        total: tickets.length,
        open: tickets.filter((ticket: PublicTicket) => ticket.status === "Open").length,
        inProgress: tickets.filter((ticket: PublicTicket) => ticket.status === "In Progress").length,
        resolved: tickets.filter((ticket: PublicTicket) => ticket.status === "Resolved").length,
        highPriority: tickets.filter((ticket: PublicTicket) => ticket.priority === "High").length
    };
}
