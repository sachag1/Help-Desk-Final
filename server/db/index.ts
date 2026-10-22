import { Collection, Db, MongoClient } from "mongodb";
import { TicketDocument } from "../type/ticket";

const DEFAULT_DB_NAME: string = "helpdesk";
const TICKETS_COLLECTION: string = "tickets";

let client: MongoClient | null = null;
let ticketsCollection: Collection<TicketDocument> | null = null;

function readUri(): string {
    const uri: string | undefined = process.env.MONGODB_URI;
    if (uri === undefined || uri === "") {
        throw new Error("MONGODB_URI environment variable is not set");
    }
    return uri;
}

// One shared connection for every database action
export async function connectDB(): Promise<void> {
    if (client !== null) {
        return;
    }

    const newClient: MongoClient = new MongoClient(readUri(), { serverSelectionTimeoutMS: 5000 });
    await newClient.connect();

    const db: Db = newClient.db(process.env.MONGODB_DB ?? DEFAULT_DB_NAME);
    const tickets: Collection<TicketDocument> = db.collection<TicketDocument>(TICKETS_COLLECTION);
    await tickets.createIndex({ createdAt: -1 });

    client = newClient;
    ticketsCollection = tickets;
    console.log("Connected to MongoDB");
}

export async function getTicketsCollection(): Promise<Collection<TicketDocument>> {
    await connectDB();
    if (ticketsCollection === null) {
        throw new Error("The tickets collection is not available");
    }
    return ticketsCollection;
}

export async function closeDB(): Promise<void> {
    if (client !== null) {
        await client.close();
    }
    client = null;
    ticketsCollection = null;
}
