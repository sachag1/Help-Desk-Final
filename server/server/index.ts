import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Server } from "node:http";
import { closeDB, connectDB } from "../db/index";
import { createUser, deleteUser, getUserById, getUsers } from "../db/actions";
import { DatabaseError, DuplicateUserError } from "../db/errors";
import { CreateUserInput, PublicUser, UserIdParams } from "../type/user";
import { ApiErrorResponse, ApiResponse } from "../type/api";

const app = express();
const PORT: number = Number(process.env.PORT ?? 3000);
const ALLOWED_ORIGINS: string[] = (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:3005").split(",");
const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

function isFilledString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function parseCreateUserInput(body: unknown): CreateUserInput | null {
    if (typeof body !== "object" || body === null) {
        return null;
    }

    const fields: Record<string, unknown> = { ...body };
    const { name, lastName, email, password, userName } = fields;

    if (!isFilledString(name) || !isFilledString(lastName) || !isFilledString(email) || !isFilledString(password) || !isFilledString(userName)) {
        return null;
    }

    return { name: name.trim(), lastName: lastName.trim(), email: email.trim(), password, userName: userName.trim() };
}

function sendError(res: Response<ApiErrorResponse>, status: number, error: string): void {
    res.status(status).json({ success: false, error });
}

function handleDbError(res: Response<ApiErrorResponse>, error: unknown, fallbackMessage: string): void {
    if (error instanceof DuplicateUserError) {
        sendError(res, 409, error.message);
    } else if (error instanceof DatabaseError && error.unavailable) {
        console.error(error.message);
        sendError(res, 503, "The database is currently unavailable");
    } else {
        console.error(error);
        sendError(res, 500, fallbackMessage);
    }
}

app.post("/users", async (req: Request, res: Response<ApiResponse<PublicUser>>): Promise<void> => {
    const input: CreateUserInput | null = parseCreateUserInput(req.body);

    if (input === null) {
        sendError(res, 400, "All fields are required");
        return;
    }
    if (!EMAIL_PATTERN.test(input.email)) {
        sendError(res, 400, "Email is not valid");
        return;
    }

    try {
        const user: PublicUser = await createUser(input);
        res.status(201).json({ success: true, data: user });
    } catch (error: unknown) {
        handleDbError(res, error, "Failed to create user");
    }
});

app.get("/users", async (_req: Request, res: Response<ApiResponse<PublicUser[]>>): Promise<void> => {
    try {
        const users: PublicUser[] = await getUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error: unknown) {
        handleDbError(res, error, "Failed to load users");
    }
});

app.get("/users/:id", async (req: Request<UserIdParams>, res: Response<ApiResponse<PublicUser>>): Promise<void> => {
    try {
        const user: PublicUser | null = await getUserById(req.params.id);

        if (user === null) {
            sendError(res, 404, "User not found");
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error: unknown) {
        handleDbError(res, error, "Failed to load user");
    }
});

app.delete("/users/:id", async (req: Request<UserIdParams>, res: Response<ApiResponse<UserIdParams>>): Promise<void> => {
    try {
        const isDeleted: boolean = await deleteUser(req.params.id);

        if (!isDeleted) {
            sendError(res, 404, "User not found");
            return;
        }

        res.status(200).json({ success: true, data: { id: req.params.id } });
    } catch (error: unknown) {
        handleDbError(res, error, "Failed to delete user");
    }
});

// Malformed JSON bodies and any other unexpected error
app.use((error: Error, _req: Request, res: Response<ApiErrorResponse>, next: NextFunction): void => {
    if (res.headersSent) {
        next(error);
        return;
    }
    if (error instanceof SyntaxError) {
        sendError(res, 400, "Request body is not valid JSON");
        return;
    }
    console.error(error);
    sendError(res, 500, "Internal server error");
});

async function start(): Promise<void> {
    await connectDB();

    const server: Server = app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

    const shutdown = async (): Promise<void> => {
        server.close();
        await closeDB();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

start().catch((error: unknown) => {
    console.error("Failed to start the server:", error instanceof Error ? error.message : error);
    process.exit(1);
});
