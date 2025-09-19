package com.fpt.evcare.dto.response;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpResponse {
    private boolean isValid;
//    String resetToken; //sử dụng token này để reset password(tăng cường bảo mật)
    // Token để sử dụng trong resetPassword
}
