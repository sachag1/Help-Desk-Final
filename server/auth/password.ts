import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH: number = 64;
const SALT_BYTES: number = 16;
const FORMAT_PREFIX: string = "scrypt";
const SEPARATOR: string = "$";

function deriveKey(password: string, salt: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        scrypt(password, salt, KEY_LENGTH, (error: Error | null, key: Buffer) => {
            if (error !== null) {
                reject(error);
            } else {
                resolve(key);
            }
        });
    });
}

// Stored format: scrypt, a random salt and the derived key, separated by a dollar sign
export async function hashPassword(password: string): Promise<string> {
    const salt: string = randomBytes(SALT_BYTES).toString("hex");
    const key: Buffer = await deriveKey(password, salt);
    return [FORMAT_PREFIX, salt, key.toString("hex")].join(SEPARATOR);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [prefix, salt, hash] = storedHash.split(SEPARATOR);
    if (prefix !== FORMAT_PREFIX || salt === undefined || hash === undefined) {
        return false;
    }
    const expected: Buffer = Buffer.from(hash, "hex");
    const actual: Buffer = await deriveKey(password, salt);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
