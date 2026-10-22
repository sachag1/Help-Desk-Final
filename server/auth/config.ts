const MIN_SECRET_LENGTH: number = 32;

export const TOKEN_TTL_SECONDS: number = 8 * 60 * 60;

export function getAuthSecret(): string {
    const secret: string | undefined = process.env.AUTH_SECRET;
    if (secret === undefined || secret.length < MIN_SECRET_LENGTH) {
        throw new Error(`AUTH_SECRET environment variable must be set (at least ${MIN_SECRET_LENGTH} characters)`);
    }
    return secret;
}
