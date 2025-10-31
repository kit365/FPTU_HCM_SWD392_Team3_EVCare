export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    refreshToken: string;
    authenticated: boolean;
}
export interface RegisterUserRequest {
    username: string;
    password: string;
    email: string;
    fullName: string;
    numberPhone: string;
    avatarUrl?: string;
}
export interface RegisterUserResponse {
    userId: string;
    email: string;
    fullName: string;
    token: string;
    refreshToken: string;
}

export interface LogoutRequest {
    userId: string;
}
