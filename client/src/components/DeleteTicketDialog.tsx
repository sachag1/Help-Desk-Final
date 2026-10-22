import { useState } from "react";
import type { MouseEvent } from "react";
import { AlertDialog } from "radix-ui";
import type { PublicTicket } from "../types/ticket";
import { messageOf } from "../utils/errors";

interface DeleteTicketDialogProps {
    ticket: PublicTicket;
    onDeleteTicket: (id: string) => Promise<void>;
}

export default function DeleteTicketDialog({ ticket, onDeleteTicket }: DeleteTicketDialogProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // The dialog stays open until the server confirmed the deletion, so a failure stays visible
    const handleConfirm = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        setIsDeleting(true);
        setError(null);

        try {
            await onDeleteTicket(ticket.id);
            setIsOpen(false);
        } catch (caught: unknown) {
            setError(`Failed to delete the ticket: ${messageOf(caught, "unknown error")}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenChange = (open: boolean): void => {
        setIsOpen(open);
        if (!open) {
            setError(null);
        }
    };

    return (
        <AlertDialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialog.Trigger className="rounded-lg border border-red-300 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                Delete
            </AlertDialog.Trigger>

            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
                <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl sm:p-6">
                    <AlertDialog.Title className="text-lg font-semibold text-slate-900">Delete ticket</AlertDialog.Title>

                    <AlertDialog.Description className="mt-2 break-words text-slate-600">
                        Are you sure you want to delete the ticket &quot;{ticket.title}&quot; from {ticket.fullName}? This cannot be undone.
                    </AlertDialog.Description>

                    {error !== null && (
                        <p role="alert" className="mt-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <AlertDialog.Cancel className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                            Cancel
                        </AlertDialog.Cancel>

                        <AlertDialog.Action
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-300"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}
