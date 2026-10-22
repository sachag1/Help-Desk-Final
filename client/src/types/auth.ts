export interface LoginInput {
    username: string;
    password: string;
}

// What the client keeps after a successful login
export interface AuthSession {
    token: string;
    username: string;
    expiresAt: string;
}
