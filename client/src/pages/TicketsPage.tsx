import { useMemo, useState } from "react";
import type { PublicTicket } from "../types/ticket";
import { useTickets } from "../hooks/useTickets";
import { DEFAULT_FILTERS, filterTickets, hasActiveFilters } from "../utils/ticketFilters";
import type { TicketFilters } from "../utils/ticketFilters";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import TicketFiltersBar from "../components/TicketFiltersBar";
import TicketDetailsDialog from "../components/TicketDetailsDialog";
import TicketList from "../components/TicketList";

export default function TicketsPage() {
    const { tickets, isLoading, error, reload, getTicket, updateTicket } = useTickets();
    const [filters, setFilters] = useState<TicketFilters>(DEFAULT_FILTERS);

    const visibleTickets: PublicTicket[] = useMemo(() => filterTickets(tickets, filters), [tickets, filters]);

    return (
        <div className="flex flex-col gap-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tickets</h1>
                    <p className="text-slate-500">
                        {isLoading || error !== null ? "Support tickets" : `${visibleTickets.length} of ${tickets.length} tickets shown`}
                    </p>
                </div>
            </header>

            <TicketFiltersBar filters={filters} onChange={setFilters} />

            {isLoading && <Loading text="Loading tickets..." />}

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
                <TicketList
                    tickets={visibleTickets}
                    isFiltered={hasActiveFilters(filters)}
                    renderActions={(ticket: PublicTicket) => (
                        <TicketDetailsDialog ticketId={ticket.id} onLoadTicket={getTicket} onUpdateTicket={updateTicket} />
                    )}
                />
            )}
        </div>
    );
}
