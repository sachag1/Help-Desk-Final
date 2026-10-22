import type { TicketPriority, TicketStatus } from "../types/ticket";

const PRIORITY_STYLES: Record<TicketPriority, string> = {
    Low: "bg-slate-100 text-slate-700",
    Medium: "bg-amber-100 text-amber-800",
    High: "bg-red-100 text-red-700"
};

const STATUS_STYLES: Record<TicketStatus, string> = {
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-violet-100 text-violet-700",
    Resolved: "bg-green-100 text-green-700"
};

const BADGE_CLASS = "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium";

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
    return <span className={`${BADGE_CLASS} ${PRIORITY_STYLES[priority]}`}>{priority}</span>;
}

export function StatusBadge({ status }: { status: TicketStatus }) {
    return <span className={`${BADGE_CLASS} ${STATUS_STYLES[status]}`}>{status}</span>;
}
