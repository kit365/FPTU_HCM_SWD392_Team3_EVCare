export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    authenticated: boolean;
}
export interface RegisterUserRequest {
    username: string;
    password: string;
    email: string;
    numberPhone: string;
}
export interface RegisterUserResponse {
    userId: string;
    email: string;
    token: string;
}

