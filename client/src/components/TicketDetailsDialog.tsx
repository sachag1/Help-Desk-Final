import { useState } from "react";
import { Dialog } from "radix-ui";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../types/ticket";
import type { PublicTicket, TicketPriority, TicketStatus, UpdateTicketInput } from "../types/ticket";
import { formatDateTime } from "../utils/format";
import { messageOf } from "../utils/errors";
import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";
import SelectField from "./SelectField";

interface TicketDetailsDialogProps {
    ticketId: string;
    onLoadTicket: (id: string) => Promise<PublicTicket>;
    onUpdateTicket: (id: string, update: UpdateTicketInput) => Promise<PublicTicket>;
}

interface TicketDraft {
    status: TicketStatus;
    priority: TicketPriority;
}

interface DetailProps {
    label: string;
    value: string;
}

function Detail({ label, value }: DetailProps) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="break-words text-slate-900">{value}</p>
        </div>
    );
}

// Details are loaded from the server by id each time the dialog opens; status and priority can be changed here
export default function TicketDetailsDialog({ ticketId, onLoadTicket, onUpdateTicket }: TicketDetailsDialogProps) {
    const [ticket, setTicket] = useState<PublicTicket | null>(null);
    const [draft, setDraft] = useState<TicketDraft | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedMessage, setSavedMessage] = useState<string | null>(null);

    const loadTicket = async (): Promise<void> => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const loaded: PublicTicket = await onLoadTicket(ticketId);
            setTicket(loaded);
            setDraft({ status: loaded.status, priority: loaded.priority });
        } catch (caught: unknown) {
            setLoadError(`Failed to load the ticket: ${messageOf(caught, "unknown error")}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean): void => {
        if (open) {
            void loadTicket();
        } else {
            setTicket(null);
            setDraft(null);
            setLoadError(null);
            setSaveError(null);
            setSavedMessage(null);
        }
    };

    const changes: UpdateTicketInput = {};
    if (ticket !== null && draft !== null) {
        if (draft.status !== ticket.status) changes.status = draft.status;
        if (draft.priority !== ticket.priority) changes.priority = draft.priority;
    }
    const hasChanges: boolean = changes.status !== undefined || changes.priority !== undefined;

    const handleSave = async (): Promise<void> => {
        if (ticket === null || !hasChanges) {
            return;
        }
        setIsSaving(true);
        setSaveError(null);
        setSavedMessage(null);
        try {
            const updated: PublicTicket = await onUpdateTicket(ticket.id, changes);
            setTicket(updated);
            setDraft({ status: updated.status, priority: updated.priority });
            setSavedMessage("The ticket was updated.");
        } catch (caught: unknown) {
            setSaveError(`Failed to update the ticket: ${messageOf(caught, "unknown error")}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root onOpenChange={handleOpenChange}>
            <Dialog.Trigger className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                View
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6">
                    <Dialog.Title className="text-xl font-semibold text-slate-900">Ticket details</Dialog.Title>
                    <Dialog.Description className="mb-4 text-sm text-slate-500">Loaded from the server by id</Dialog.Description>

                    {isLoading && <Loading text="Loading the ticket..." />}
                    {loadError !== null && <ErrorMessage message={loadError} />}

                    {ticket !== null && draft !== null && (
                        <div className="flex flex-col gap-4">
                            <h2 className="break-words text-lg font-semibold text-slate-900">{ticket.title}</h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Detail label="Customer" value={ticket.fullName} />
                                <Detail label="Email" value={ticket.email} />
                                <Detail label="Phone" value={ticket.phone} />
                                <Detail label="Category" value={ticket.category} />
                                <Detail label="Created" value={formatDateTime(ticket.createdAt)} />
                                <Detail label="Last updated" value={formatDateTime(ticket.updatedAt)} />
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                                <p className="whitespace-pre-wrap break-words text-slate-900">{ticket.description}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <SelectField<TicketStatus>
                                    id={`status-${ticket.id}`}
                                    label="Status"
                                    value={draft.status}
                                    options={TICKET_STATUSES}
                                    placeholder="Status"
                                    disabled={isSaving}
                                    onChange={(status: TicketStatus) => setDraft({ ...draft, status })}
                                />
                                <SelectField<TicketPriority>
                                    id={`priority-${ticket.id}`}
                                    label="Priority"
                                    value={draft.priority}
                                    options={TICKET_PRIORITIES}
                                    placeholder="Priority"
                                    disabled={isSaving}
                                    onChange={(priority: TicketPriority) => setDraft({ ...draft, priority })}
                                />
                            </div>

                            {saveError !== null && <ErrorMessage message={saveError} />}
                            {savedMessage !== null && (
                                <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-green-700">
                                    {savedMessage}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => void handleSave()}
                                disabled={!hasChanges || isSaving}
                                className="self-start rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:bg-slate-300"
                            >
                                {isSaving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <Dialog.Close className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                            Close
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
