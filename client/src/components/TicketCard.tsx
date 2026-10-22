import type { ReactNode } from "react";
import type { PublicTicket } from "../types/ticket";
import { formatDateTime } from "../utils/format";
import { PriorityBadge, StatusBadge } from "./Badges";

interface TicketCardProps {
    ticket: PublicTicket;
    actions: ReactNode;
}

export default function TicketCard({ ticket, actions }: TicketCardProps) {
    return (
        <li className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
                <h3 className="break-words text-lg font-semibold text-slate-900">{ticket.title}</h3>
                <p className="break-words text-sm text-slate-600">
                    {ticket.fullName} <span className="text-slate-400">&middot;</span> {ticket.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>{ticket.category}</span>
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                    <span>Created {formatDateTime(ticket.createdAt)}</span>
                </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        </li>
    );
}
