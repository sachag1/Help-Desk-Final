import { createHmac, timingSafeEqual } from "node:crypto";
import { AuthTokenPayload } from "../type/admin";

// Signed token in the JWT format (HS256), built with the Node.js crypto module
function toBase64Url(value: string | Buffer): string {
    return Buffer.from(value).toString("base64url");
}

const HEADER: string = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));

function sign(content: string, secret: string): Buffer {
    return createHmac("sha256", secret).update(content).digest();
}

function isTokenPayload(value: unknown): value is AuthTokenPayload {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const candidate: Record<string, unknown> = { ...value };
    return typeof candidate.sub === "string" && typeof candidate.iat === "number" && typeof candidate.exp === "number";
}

export function createToken(username: string, ttlSeconds: number, secret: string): { token: string; expiresAt: Date } {
    const issuedAt: number = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = { sub: username, iat: issuedAt, exp: issuedAt + ttlSeconds };
    const content: string = `${HEADER}.${toBase64Url(JSON.stringify(payload))}`;
    const token: string = `${content}.${toBase64Url(sign(content, secret))}`;
    return { token, expiresAt: new Date(payload.exp * 1000) };
}

// Returns the payload of a valid, unexpired token, otherwise null
export function verifyToken(token: string, secret: string): AuthTokenPayload | null {
    const parts: string[] = token.split(".");
    if (parts.length !== 3 || parts[0] !== HEADER) {
        return null;
    }
    const [header, body, signature] = parts;
    const expected: Buffer = sign(`${header}.${body}`, secret);
    const received: Buffer = Buffer.from(signature, "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
        return null;
    }

    let payload: unknown;
    try {
        payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    } catch {
        return null;
    }
    if (!isTokenPayload(payload) || payload.exp <= Math.floor(Date.now() / 1000)) {
        return null;
    }
    return payload;
}
