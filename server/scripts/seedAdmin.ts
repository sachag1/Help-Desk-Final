import { hashPassword } from "../auth/password";
import { upsertAdmin } from "../db/adminActions";
import { closeDB, connectDB } from "../db/index";

const MIN_PASSWORD_LENGTH: number = 8;

// Creates (or updates) the administrator from ADMIN_USERNAME / ADMIN_PASSWORD. Run: npm run seed:admin
async function seed(): Promise<void> {
    const username: string | undefined = process.env.ADMIN_USERNAME?.trim();
    const password: string | undefined = process.env.ADMIN_PASSWORD;
    if (username === undefined || username === "" || password === undefined || password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`ADMIN_USERNAME and ADMIN_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters) must be set`);
    }

    await connectDB();
    await upsertAdmin({ username, passwordHash: await hashPassword(password) });
    console.log(`Administrator "${username}" is ready`);
}

seed()
    .catch((error: unknown) => {
        console.error("Seeding failed:", error instanceof Error ? error.message : error);
        process.exitCode = 1;
    })
    .finally(() => closeDB());
