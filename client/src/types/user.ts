export interface PublicUser {
    id: string;
    name: string;
    lastName: string;
    email: string;
    userName: string;
}

export interface CreateUserInput {
    name: string;
    lastName: string;
    email: string;
    password: string;
    userName: string;
}
