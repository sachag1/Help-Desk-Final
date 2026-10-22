import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { PublicTicket } from "../types/ticket";
import { useTickets } from "../hooks/useTickets";
import { computeTicketStats } from "../utils/ticketStats";
import type { TicketStats } from "../utils/ticketStats";
import { formatDateTime } from "../utils/format";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import StatCard from "../components/StatCard";

const RECENT_COUNT = 5;

export default function DashboardPage() {
    const { tickets, isLoading, error, reload } = useTickets();
    const stats: TicketStats = useMemo(() => computeTicketStats(tickets), [tickets]);
    const recent: PublicTicket[] = useMemo(() => tickets.slice(0, RECENT_COUNT), [tickets]);

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Overview of the support tickets</p>
                </div>
                <Link to="/admin/tickets" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
                    Manage tickets
                </Link>
            </header>

            {isLoading && <Loading text="Loading the dashboard..." />}

            {error !== null && (
                <div className="flex flex-col items-start gap-3">
                    <ErrorMessage message={error} />
                    <button
                        type="button"
                        onClick={() => void reload()}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!isLoading && error === null && (
                <>
                    <section aria-label="Ticket statistics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard label="Total Tickets" value={stats.total} />
                        <StatCard label="Open" value={stats.open} tone="warning" />
                        <StatCard label="In Progress" value={stats.inProgress} />
                        <StatCard label="Resolved" value={stats.resolved} tone="success" />
                        <StatCard label="High Priority" value={stats.highPriority} tone="danger" />
                    </section>

                    <section aria-label="Latest tickets" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-lg font-semibold text-slate-900">Latest tickets</h2>
                        {recent.length === 0 ? (
                            <p className="text-slate-500">No support tickets were found.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recent.map((ticket: PublicTicket) => (
                                    <li key={ticket.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                                        <span className="font-medium text-slate-800">{ticket.title}</span>
                                        <span className="text-sm text-slate-500">
                                            {ticket.status} - {formatDateTime(ticket.createdAt)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
