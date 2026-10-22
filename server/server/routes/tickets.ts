import { Request, Response, Router } from "express";
import { createTicket, deleteTicket, getTicketById, getTickets, updateTicket } from "../../db/ticketActions";
import { isValidObjectId } from "../../db/objectId";
import { ApiErrorResponse, ApiResponse, DeletedTicketResult } from "../../type/api";
import { CreateTicketInput, PublicTicket, TicketIdParams, UpdateTicketInput } from "../../type/ticket";
import { handleDbError, sendError } from "../http";
import { ParseResult, parseCreateTicketInput, parseUpdateTicketInput } from "../validation";

export const ticketsRouter: Router = Router();

ticketsRouter.post(
    "/",
    async (req: Request<Record<string, never>, ApiResponse<PublicTicket>, unknown>, res: Response<ApiResponse<PublicTicket>>): Promise<void> => {
        const parsed: ParseResult<CreateTicketInput> = parseCreateTicketInput(req.body);
        if (!parsed.ok) {
            sendError(res, 400, `Invalid ticket: ${parsed.errors.join("; ")}`);
            return;
        }

        try {
            const ticket: PublicTicket = await createTicket(parsed.value);
            res.status(201).json({ success: true, data: ticket });
        } catch (error: unknown) {
            handleDbError(res, error, "Failed to create the ticket");
        }
    }
);

ticketsRouter.get("/", async (_req: Request, res: Response<ApiResponse<PublicTicket[]>>): Promise<void> => {
    try {
        const tickets: PublicTicket[] = await getTickets();
        res.status(200).json({ success: true, data: tickets });
    } catch (error: unknown) {
        handleDbError(res, error, "Failed to load the tickets");
    }
});

ticketsRouter.get("/:id", async (req: Request<TicketIdParams>, res: Response<ApiResponse<PublicTicket>>): Promise<void> => {
    const id: string = req.params.id;
    if (!isValidObjectId(id)) {
        sendError(res, 400, "Invalid ticket id");
        return;
    }

    try {
        const ticket: PublicTicket | null = await getTicketById(id);
        if (ticket === null) {
            sendError(res, 404, "Ticket not found");
            return;
        }
        res.status(200).json({ success: true, data: ticket });
    } catch (error: unknown) {
        handleDbError(res, error, "Failed to load the ticket");
    }
});

ticketsRouter.patch(
    "/:id",
    async (req: Request<TicketIdParams, ApiResponse<PublicTicket>, unknown>, res: Response<ApiResponse<PublicTicket>>): Promise<void> => {
        const id: string = req.params.id;
        if (!isValidObjectId(id)) {
            sendError(res, 400, "Invalid ticket id");
            return;
        }

        const parsed: ParseResult<UpdateTicketInput> = parseUpdateTicketInput(req.body);
        if (!parsed.ok) {
            sendError(res, 400, `Invalid update: ${parsed.errors.join("; ")}`);
            return;
        }

        try {
            const ticket: PublicTicket | null = await updateTicket(id, parsed.value);
            if (ticket === null) {
                sendError(res, 404, "Ticket not found");
                return;
            }
            res.status(200).json({ success: true, data: ticket });
        } catch (error: unknown) {
            handleDbError(res, error, "Failed to update the ticket");
        }
    }
);

ticketsRouter.delete(
    "/:id",
    async (req: Request<TicketIdParams>, res: Response<ApiResponse<DeletedTicketResult> | ApiErrorResponse>): Promise<void> => {
        const id: string = req.params.id;
        if (!isValidObjectId(id)) {
            sendError(res, 400, "Invalid ticket id");
            return;
        }

        try {
            const isDeleted: boolean = await deleteTicket(id);
            if (!isDeleted) {
                sendError(res, 404, "Ticket not found");
                return;
            }
            res.status(200).json({ success: true, data: { id } });
        } catch (error: unknown) {
            handleDbError(res, error, "Failed to delete the ticket");
        }
    }
);
