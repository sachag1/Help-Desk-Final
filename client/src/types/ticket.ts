export const TICKET_CATEGORIES = ["Hardware", "Software", "Network", "Account", "Other"] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_PRIORITIES = ["Low", "Medium", "High"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ["Open", "In Progress", "Resolved"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

// Ticket as returned by the server (dates are ISO strings)
export interface PublicTicket {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
}

// Data sent when a customer opens a ticket
export interface CreateTicketInput {
    fullName: string;
    email: string;
    phone: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
}

// The only fields an administrator may change
export interface UpdateTicketInput {
    status?: TicketStatus;
    priority?: TicketPriority;
}

// State of the public form: a select can be "not chosen yet"
export interface TicketFormState {
    fullName: string;
    email: string;
    phone: string;
    title: string;
    description: string;
    category: TicketCategory | "";
    priority: TicketPriority | "";
}

export type TicketFormErrors = Partial<Record<keyof TicketFormState, string>>;
