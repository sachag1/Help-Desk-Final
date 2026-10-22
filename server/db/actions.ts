import { randomBytes, scryptSync } from "node:crypto";
import { Collection, DeleteResult, InsertOneResult, MongoNetworkError, MongoServerError, MongoServerSelectionError, ObjectId, WithId } from "mongodb";
import { getUsersCollection } from "./index";
import { DatabaseError, DuplicateField, DuplicateUserError } from "./errors";
import { CreateUserInput, PublicUser, UserDocument } from "../type/user";

const OBJECT_ID_PATTERN: RegExp = /^[0-9a-fA-F]{24}$/;

function hashPassword(password: string): string {
    const salt: string = randomBytes(16).toString("hex");
    const hash: string = scryptSync(password, salt, 64).toString("hex");
    return `scrypt$${salt}$${hash}`;
}

function toPublicUser(user: WithId<UserDocument>): PublicUser {
    return {
        id: user._id.toHexString(),
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName
    };
}

function duplicateField(error: unknown): DuplicateField | null {
    if (error instanceof MongoServerError && error.code === 11000) {
        const keyPattern: Record<string, unknown> = error.keyPattern ?? {};
        if ("email" in keyPattern) {
            return "email";
        }
        if ("userName" in keyPattern) {
            return "userName";
        }
    }
    return null;
}

function wrapError(error: unknown, action: string): DatabaseError {
    const reason: string = error instanceof Error ? error.message : String(error);
    const unavailable: boolean = error instanceof MongoServerSelectionError || error instanceof MongoNetworkError;
    return new DatabaseError(`Database action "${action}" failed: ${reason}`, unavailable);
}

function isValidId(id: string): boolean {
    return OBJECT_ID_PATTERN.test(id);
}

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
    try {
        const users: Collection<UserDocument> = await getUsersCollection();
        const document: UserDocument = { ...input, password: hashPassword(input.password) };
        const result: InsertOneResult<UserDocument> = await users.insertOne(document);
        return toPublicUser({ ...document, _id: result.insertedId });
    } catch (error: unknown) {
        const field: DuplicateField | null = duplicateField(error);
        if (field !== null) {
            throw new DuplicateUserError(field);
        }
        throw wrapError(error, "createUser");
    }
}

export async function getUsers(): Promise<PublicUser[]> {
    try {
        const users: Collection<UserDocument> = await getUsersCollection();
        const documents: WithId<UserDocument>[] = await users.find().toArray();
        return documents.map(toPublicUser);
    } catch (error: unknown) {
        throw wrapError(error, "getUsers");
    }
}

export async function getUserById(id: string): Promise<PublicUser | null> {
    if (!isValidId(id)) {
        return null;
    }
    try {
        const users: Collection<UserDocument> = await getUsersCollection();
        const document: WithId<UserDocument> | null = await users.findOne({ _id: new ObjectId(id) });
        return document === null ? null : toPublicUser(document);
    } catch (error: unknown) {
        throw wrapError(error, "getUserById");
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    if (!isValidId(id)) {
        return false;
    }
    try {
        const users: Collection<UserDocument> = await getUsersCollection();
        const result: DeleteResult = await users.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1;
    } catch (error: unknown) {
        throw wrapError(error, "deleteUser");
    }
}
