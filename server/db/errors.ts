import { MongoNetworkError, MongoServerSelectionError } from "mongodb";

export class DatabaseError extends Error {
    readonly unavailable: boolean;

    constructor(message: string, unavailable: boolean = false) {
        super(message);
        this.name = "DatabaseError";
        this.unavailable = unavailable;
    }
}

// Wraps any driver failure so the server layer never sees raw MongoDB errors
export function toDatabaseError(error: unknown, action: string): DatabaseError {
    const reason: string = error instanceof Error ? error.message : String(error);
    const unavailable: boolean = error instanceof MongoServerSelectionError || error instanceof MongoNetworkError;
    return new DatabaseError(`Database action "${action}" failed: ${reason}`, unavailable);
}
