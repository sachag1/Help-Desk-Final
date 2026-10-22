import type { ReactNode } from "react";
import type { PublicTicket } from "../types/ticket";
import TicketCard from "./TicketCard";

interface TicketListProps {
    tickets: PublicTicket[];
    // true when the list is empty because of the search or the filters, not because there are no tickets
    isFiltered: boolean;
    renderActions: (ticket: PublicTicket) => ReactNode;
}

export default function TicketList({ tickets, isFiltered, renderActions }: TicketListProps) {
    if (tickets.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                {isFiltered ? "No tickets match the current search and filters." : "No support tickets were found."}
            </div>
        );
    }

    return (
        <ul aria-label="Tickets" className="flex flex-col gap-3">
            {tickets.map((ticket: PublicTicket) => (
                <TicketCard key={ticket.id} ticket={ticket} actions={renderActions(ticket)} />
            ))}
        </ul>
    );
}
