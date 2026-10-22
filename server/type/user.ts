export interface CreateUserInput {
    name: string;
    lastName: string;
    email: string;
    password: string;
    userName: string;
}

// User as stored in MongoDB (the password is stored hashed)
export interface UserDocument {
    name: string;
    lastName: string;
    email: string;
    password: string;
    userName: string;
}

// User as returned to the client: no password, no ObjectId
export interface PublicUser {
    id: string;
    name: string;
    lastName: string;
    email: string;
    userName: string;
}

export interface UserIdParams {
    id: string;
}
