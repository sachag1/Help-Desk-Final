export type DuplicateField = "email" | "userName";

export class DatabaseError extends Error {
    readonly unavailable: boolean;

    constructor(message: string, unavailable: boolean = false) {
        super(message);
        this.name = "DatabaseError";
        this.unavailable = unavailable;
    }
}

export class DuplicateUserError extends Error {
    readonly field: DuplicateField;

    constructor(field: DuplicateField) {
        super(`A user with this ${field} already exists`);
        this.name = "DuplicateUserError";
        this.field = field;
    }
}
