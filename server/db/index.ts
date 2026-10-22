import { Collection, Db, MongoClient } from "mongodb";
import { UserDocument } from "../type/user";

const DEFAULT_DB_NAME: string = "users_project";
const USERS_COLLECTION: string = "users";

let client: MongoClient | null = null;
let usersCollection: Collection<UserDocument> | null = null;

function readUri(): string {
    const uri: string | undefined = process.env.MONGODB_URI;
    if (uri === undefined || uri === "") {
        throw new Error("MONGODB_URI environment variable is not set");
    }
    return uri;
}

// One shared connection for every database action
export async function connectDB(): Promise<Collection<UserDocument>> {
    if (usersCollection !== null) {
        return usersCollection;
    }

    const newClient: MongoClient = new MongoClient(readUri(), { serverSelectionTimeoutMS: 5000 });
    await newClient.connect();

    const db: Db = newClient.db(process.env.MONGODB_DB ?? DEFAULT_DB_NAME);
    const collection: Collection<UserDocument> = db.collection<UserDocument>(USERS_COLLECTION);
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ userName: 1 }, { unique: true });

    client = newClient;
    usersCollection = collection;
    console.log("Connected to MongoDB");
    return collection;
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
    return connectDB();
}

export async function closeDB(): Promise<void> {
    if (client !== null) {
        await client.close();
    }
    client = null;
    usersCollection = null;
}
