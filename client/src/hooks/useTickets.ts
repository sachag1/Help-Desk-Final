import { useCallback, useEffect, useState } from "react";
import type { PublicTicket, UpdateTicketInput } from "../types/ticket";
import * as ticketsApi from "../services/ticketsApi";
import { messageOf } from "../utils/errors";

export interface UseTicketsResult {
    tickets: PublicTicket[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    getTicket: (id: string) => Promise<PublicTicket>;
    updateTicket: (id: string, update: UpdateTicketInput) => Promise<PublicTicket>;
    deleteTicket: (id: string) => Promise<void>;
}

// Loads the tickets once and keeps the list in sync after every update or delete (no page refresh)
export function useTickets(): UseTicketsResult {
    const [tickets, setTickets] = useState<PublicTicket[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            setTickets(await ticketsApi.getTickets());
        } catch (caught: unknown) {
            setError(`Failed to load the tickets: ${messageOf(caught, "unknown error")}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
        void reload();
    }, [reload]);

    const getTicket = useCallback((id: string): Promise<PublicTicket> => ticketsApi.getTicketById(id), []);

    const updateTicket = useCallback(async (id: string, update: UpdateTicketInput): Promise<PublicTicket> => {
        const updated: PublicTicket = await ticketsApi.updateTicket(id, update);
        setTickets((previous: PublicTicket[]) => previous.map((ticket: PublicTicket) => (ticket.id === id ? updated : ticket)));
        return updated;
    }, []);

    const deleteTicket = useCallback(async (id: string): Promise<void> => {
        await ticketsApi.deleteTicket(id);
        setTickets((previous: PublicTicket[]) => previous.filter((ticket: PublicTicket) => ticket.id !== id));
    }, []);

    return { tickets, isLoading, error, reload, getTicket, updateTicket, deleteTicket };
}
