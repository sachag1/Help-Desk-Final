export const TICKET_CATEGORIES = ["Hardware", "Software", "Network", "Account", "Other"] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_PRIORITIES = ["Low", "Medium", "High"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ["Open", "In Progress", "Resolved"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

// Data the public form sends. Status and dates are decided by the server.
export interface CreateTicketInput {
    fullName: string;
    email: string;
    phone: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
}

// Ticket as stored in MongoDB
export interface TicketDocument extends CreateTicketInput {
    status: TicketStatus;
    createdAt: Date;
    updatedAt: Date;
}

// Ticket as returned to the client: string id, ISO dates
export interface PublicTicket extends CreateTicketInput {
    id: string;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
}

// The only fields an administrator may change
export interface UpdateTicketInput {
    status?: TicketStatus;
    priority?: TicketPriority;
}

export type TicketIdParams = {
    id: string;
};
