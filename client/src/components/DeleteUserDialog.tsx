import { useState } from "react";
import type { MouseEvent } from "react";
import { AlertDialog } from "radix-ui";
import type { PublicUser } from "../types/user";

interface DeleteUserDialogProps {
    user: PublicUser;
    onDeleteUser: (id: string) => Promise<void>;
}

export default function DeleteUserDialog({ user, onDeleteUser }: DeleteUserDialogProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Keep the dialog open until the server confirmed the deletion, so a failure stays visible
    const handleConfirm = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        setIsDeleting(true);
        setError(null);

        try {
            await onDeleteUser(user.id);
            setIsOpen(false);
        } catch (caught: unknown) {
            setError(caught instanceof Error ? `Failed to delete user: ${caught.message}` : "Failed to delete user");
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
                <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
                <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
                    <AlertDialog.Title className="text-lg font-semibold text-slate-900">
                        Delete User
                    </AlertDialog.Title>

                    <AlertDialog.Description className="mt-2 text-slate-600">
                        Are you sure you want to delete {user.name} {user.lastName}?
                    </AlertDialog.Description>

                    {error !== null && <p className="mt-3 text-sm text-red-600">{error}</p>}

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
