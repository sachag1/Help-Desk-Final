import { Collection } from "mongodb";
import { getAdminsCollection } from "./index";
import { toDatabaseError } from "./errors";
import { AdminDocument } from "../type/admin";

export async function findAdminByUsername(username: string): Promise<AdminDocument | null> {
    try {
        const admins: Collection<AdminDocument> = await getAdminsCollection();
        return await admins.findOne({ username }, { projection: { _id: 0, username: 1, passwordHash: 1 } });
    } catch (error: unknown) {
        throw toDatabaseError(error, "findAdminByUsername");
    }
}

// Creates the administrator or replaces its password hash (used by the seed script)
export async function upsertAdmin(admin: AdminDocument): Promise<void> {
    try {
        const admins: Collection<AdminDocument> = await getAdminsCollection();
        await admins.updateOne({ username: admin.username }, { $set: { passwordHash: admin.passwordHash } }, { upsert: true });
    } catch (error: unknown) {
        throw toDatabaseError(error, "upsertAdmin");
    }
}
