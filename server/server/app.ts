import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import { ApiErrorResponse } from "../type/api";
import { sendError } from "./http";
import { ticketsRouter } from "./routes/tickets";

const DEFAULT_ORIGINS: string = "http://localhost:5173,http://localhost:3005";

export function createApp(): Express {
    const app: Express = express();
    const allowedOrigins: string[] = (process.env.CORS_ORIGINS ?? DEFAULT_ORIGINS).split(",").map((origin: string) => origin.trim());

    app.use(cors({ origin: allowedOrigins, exposedHeaders: ["Content-Disposition"] }));
    app.use(express.json({ limit: "100kb" }));

    app.use("/tickets", ticketsRouter);

    app.use((_req: Request, res: Response<ApiErrorResponse>): void => {
        sendError(res, 404, "Route not found");
    });

    // Malformed JSON bodies and any other unexpected error
    app.use((error: Error, _req: Request, res: Response<ApiErrorResponse>, next: NextFunction): void => {
        if (res.headersSent) {
            next(error);
            return;
        }
        if (error instanceof SyntaxError) {
            sendError(res, 400, "The request body is not valid JSON");
            return;
        }
        console.error(error);
        sendError(res, 500, "Internal server error");
    });

    return app;
}
