import { useCallback, useEffect, useState } from "react";
import type { CreateUserInput, PublicUser } from "../types/user";
import * as usersApi from "../services/usersApi";

export interface UseUsersResult {
    users: PublicUser[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    createUser: (input: CreateUserInput) => Promise<PublicUser>;
    deleteUser: (id: string) => Promise<void>;
    getUser: (id: string) => Promise<PublicUser>;
}

export function useUsers(): UseUsersResult {
    const [users, setUsers] = useState<PublicUser[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            setUsers(await usersApi.getUsers());
        } catch (caught: unknown) {
            setError(caught instanceof Error ? `Failed to load users: ${caught.message}` : "Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
        void reload();
    }, [reload]);

    const createUser = useCallback(async (input: CreateUserInput): Promise<PublicUser> => {
        const created: PublicUser = await usersApi.createUser(input);
        setUsers((previous: PublicUser[]) => [...previous, created]);
        return created;
    }, []);

    const deleteUser = useCallback(async (id: string): Promise<void> => {
        await usersApi.deleteUser(id);
        setUsers((previous: PublicUser[]) => previous.filter((user: PublicUser) => user.id !== id));
    }, []);

    const getUser = useCallback((id: string): Promise<PublicUser> => usersApi.getUserById(id), []);

    return { users, isLoading, error, reload, createUser, deleteUser, getUser };
}
