import { useMemo, useState } from "react";
import type { PublicUser } from "./types/user";
import { useUsers } from "./hooks/useUsers";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import SearchBar from "./components/SearchBar";
import Loading from "./components/Loading";
import ErrorMessage from "./components/ErrorMessage";

function matchesSearch(user: PublicUser, query: string): boolean {
    const needle: string = query.trim().toLowerCase();
    if (needle === "") {
        return true;
    }
    return [user.name, user.lastName, user.userName, user.email].some((field: string) => field.toLowerCase().includes(needle));
}

export default function App() {
    const { users, isLoading, error, reload, createUser, deleteUser, getUser } = useUsers();
    const [search, setSearch] = useState<string>("");

    const visibleUsers: PublicUser[] = useMemo(
        () => users.filter((user: PublicUser) => matchesSearch(user, search)),
        [users, search]
    );

    return (
        <div className="min-h-screen bg-slate-100 py-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4">
                <header>
                    <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
                    <p className="text-slate-500">React + TypeScript + Express + MongoDB</p>
                </header>

                <UserForm onCreateUser={createUser} />

                <SearchBar value={search} onChange={setSearch} />

                {isLoading && <Loading text="Loading users..." />}
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
                    <UserList
                        users={visibleUsers}
                        isFiltered={search.trim() !== ""}
                        onDeleteUser={deleteUser}
                        onLoadUser={getUser}
                    />
                )}
            </div>
        </div>
    );
}
