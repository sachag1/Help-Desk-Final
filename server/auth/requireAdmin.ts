import { NextFunction, Request, Response } from "express";
import { findAdminByUsername } from "../db/adminActions";
import { handleDbError, sendError } from "../server/http";
import { ApiErrorResponse } from "../type/api";
import { AdminDocument, AuthTokenPayload } from "../type/admin";
import { getAuthSecret } from "./config";
import { verifyToken } from "./token";

const BEARER_PREFIX: string = "Bearer ";

// Express middleware: lets the request continue only when it carries a valid administrator token
export async function requireAdmin(req: Request, res: Response<ApiErrorResponse>, next: NextFunction): Promise<void> {
    const header: string | undefined = req.get("Authorization");
    if (header === undefined || !header.startsWith(BEARER_PREFIX)) {
        sendError(res, 401, "Authentication is required");
        return;
    }

    const payload: AuthTokenPayload | null = verifyToken(header.slice(BEARER_PREFIX.length), getAuthSecret());
    if (payload === null) {
        sendError(res, 401, "The session is invalid or has expired. Please log in again.");
        return;
    }

    try {
        const admin: AdminDocument | null = await findAdminByUsername(payload.sub);
        if (admin === null) {
            sendError(res, 403, "Access denied");
            return;
        }
        next();
    } catch (error: unknown) {
        handleDbError(res, error, "Failed to check the permissions");
    }
}
