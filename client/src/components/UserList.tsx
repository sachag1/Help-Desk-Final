import type { PublicUser } from "../types/user";
import UserCard from "./UserCard";

interface UserListProps {
    users: PublicUser[];
    isFiltered: boolean;
    onDeleteUser: (id: string) => Promise<void>;
    onLoadUser: (id: string) => Promise<PublicUser>;
}

export default function UserList({ users, isFiltered, onDeleteUser, onLoadUser }: UserListProps) {
    if (users.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                {isFiltered ? "No users match your search" : "No users found"}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user: PublicUser) => (
                <UserCard key={user.id} user={user} onDeleteUser={onDeleteUser} onLoadUser={onLoadUser} />
            ))}
        </div>
    );
}
