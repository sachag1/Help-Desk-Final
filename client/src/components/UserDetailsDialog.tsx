import { useState } from "react";
import { Dialog } from "radix-ui";
import type { PublicUser } from "../types/user";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

interface UserDetailsDialogProps {
    userId: string;
    onLoadUser: (id: string) => Promise<PublicUser>;
}

export default function UserDetailsDialog({ userId, onLoadUser }: UserDetailsDialogProps) {
    const [user, setUser] = useState<PublicUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadUser = async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            setUser(await onLoadUser(userId));
        } catch (caught: unknown) {
            setError(caught instanceof Error ? `Failed to load user: ${caught.message}` : "Failed to load user");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean): void => {
        if (open) {
            void loadUser();
        } else {
            setUser(null);
            setError(null);
        }
    };

    return (
        <Dialog.Root onOpenChange={handleOpenChange}>
            <Dialog.Trigger className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                View
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-xl font-semibold text-slate-900">
                        User Details
                    </Dialog.Title>

                    <Dialog.Description className="mb-4 text-sm text-slate-500">
                        Loaded from the server by id
                    </Dialog.Description>

                    {isLoading && <Loading text="Loading user..." />}
                    {error !== null && <ErrorMessage message={error} />}

                    {user !== null && (
                        <div className="flex flex-col gap-3">
                            <p className="text-lg font-semibold text-slate-900">{user.name} {user.lastName}</p>

                            <div>
                                <p className="text-sm text-slate-500">Username</p>
                                <p className="text-slate-900">{user.userName}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="break-all text-slate-900">{user.email}</p>
                            </div>
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
