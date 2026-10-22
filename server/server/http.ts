import { Response } from "express";
import { DatabaseError } from "../db/errors";
import { ApiErrorResponse } from "../type/api";

export function sendError(res: Response<ApiErrorResponse>, status: number, error: string): void {
    res.status(status).json({ success: false, error });
}

// Maps a failure of the database layer to an HTTP answer without leaking internal details
export function handleDbError(res: Response<ApiErrorResponse>, error: unknown, fallbackMessage: string): void {
    if (error instanceof DatabaseError && error.unavailable) {
        console.error(error.message);
        sendError(res, 503, "The service is temporarily unavailable. Please try again later.");
        return;
    }
    console.error(error);
    sendError(res, 500, fallbackMessage);
}
