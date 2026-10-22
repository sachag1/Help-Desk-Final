import type { PublicUser } from "../types/user";
import UserDetailsDialog from "./UserDetailsDialog";
import DeleteUserDialog from "./DeleteUserDialog";

interface UserCardProps {
    user: PublicUser;
    onDeleteUser: (id: string) => Promise<void>;
    onLoadUser: (id: string) => Promise<PublicUser>;
}

export default function UserCard({ user, onDeleteUser, onLoadUser }: UserCardProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
                <h3 className="text-lg font-semibold text-slate-900">{user.name} {user.lastName}</h3>
                <p className="text-sm text-violet-600">@{user.userName}</p>
                <p className="break-all text-sm text-slate-500">{user.email}</p>
            </div>

            <div className="mt-auto flex gap-2">
                <UserDetailsDialog userId={user.id} onLoadUser={onLoadUser} />
                <DeleteUserDialog user={user} onDeleteUser={onDeleteUser} />
            </div>
        </div>
    );
}
