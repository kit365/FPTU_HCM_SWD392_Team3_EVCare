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
    fullName: string;
    numberPhone: string;
}
export interface RegisterUserResponse {
    userId: string;
    email: string;
    fullName: string;
    token: string;
    refreshToken: string;
}

