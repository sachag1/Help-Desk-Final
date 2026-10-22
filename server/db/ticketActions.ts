import { Collection, DeleteResult, InsertOneResult, ObjectId, WithId } from "mongodb";
import { getTicketsCollection } from "./index";
import { toDatabaseError } from "./errors";
import { isValidObjectId } from "./objectId";
import { CreateTicketInput, PublicTicket, TicketDocument, UpdateTicketInput } from "../type/ticket";

function toPublicTicket(ticket: WithId<TicketDocument>): PublicTicket {
    return {
        id: ticket._id.toHexString(),
        fullName: ticket.fullName,
        email: ticket.email,
        phone: ticket.phone,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString()
    };
}

export async function createTicket(input: CreateTicketInput): Promise<PublicTicket> {
    try {
        const tickets: Collection<TicketDocument> = await getTicketsCollection();
        const now: Date = new Date();
        const document: TicketDocument = { ...input, status: "Open", createdAt: now, updatedAt: now };
        const result: InsertOneResult<TicketDocument> = await tickets.insertOne(document);
        return toPublicTicket({ ...document, _id: result.insertedId });
    } catch (error: unknown) {
        throw toDatabaseError(error, "createTicket");
    }
}

export async function getTickets(): Promise<PublicTicket[]> {
    try {
        const tickets: Collection<TicketDocument> = await getTicketsCollection();
        const documents: WithId<TicketDocument>[] = await tickets.find().sort({ createdAt: -1 }).toArray();
        return documents.map(toPublicTicket);
    } catch (error: unknown) {
        throw toDatabaseError(error, "getTickets");
    }
}

export async function getTicketById(id: string): Promise<PublicTicket | null> {
    if (!isValidObjectId(id)) {
        return null;
    }
    try {
        const tickets: Collection<TicketDocument> = await getTicketsCollection();
        const document: WithId<TicketDocument> | null = await tickets.findOne({ _id: new ObjectId(id) });
        return document === null ? null : toPublicTicket(document);
    } catch (error: unknown) {
        throw toDatabaseError(error, "getTicketById");
    }
}

export async function updateTicket(id: string, update: UpdateTicketInput): Promise<PublicTicket | null> {
    if (!isValidObjectId(id)) {
        return null;
    }
    try {
        const tickets: Collection<TicketDocument> = await getTicketsCollection();
        const updated: WithId<TicketDocument> | null = await tickets.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...update, updatedAt: new Date() } },
            { returnDocument: "after" }
        );
        return updated === null ? null : toPublicTicket(updated);
    } catch (error: unknown) {
        throw toDatabaseError(error, "updateTicket");
    }
}

export async function deleteTicket(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
        return false;
    }
    try {
        const tickets: Collection<TicketDocument> = await getTicketsCollection();
        const result: DeleteResult = await tickets.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1;
    } catch (error: unknown) {
        throw toDatabaseError(error, "deleteTicket");
    }
}
