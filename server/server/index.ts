import { Server } from "node:http";
import { closeDB, connectDB } from "../db/index";
import { createApp } from "./app";

const PORT: number = Number(process.env.PORT ?? 3000);

async function start(): Promise<void> {
    await connectDB();

    const server: Server = createApp().listen(PORT, () => {
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
