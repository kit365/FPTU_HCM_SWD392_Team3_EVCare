
export interface VerifyOtpRequest {
email : string
otp : string
}

export interface RequestOtpRequest {
    email : string
}


export interface VerifyOtpResponse {
    isValid : boolean
}


export interface ResetPasswordRequest {
    email : string
    otp : string
    newPassword : string
}
