// Administrator as stored in MongoDB: the password is only kept as a salted scrypt hash
export interface AdminDocument {
    username: string;
    passwordHash: string;
}

export interface AdminLoginInput {
    username: string;
    password: string;
}

export interface LoginResult {
    token: string;
    username: string;
    expiresAt: string;
}

export interface AuthTokenPayload {
    sub: string;
    iat: number;
    exp: number;
}
