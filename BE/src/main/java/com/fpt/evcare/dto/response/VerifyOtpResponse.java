package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class VerifyOtpResponse {
    @JsonProperty("isValid")
    private boolean isValid;
//    String resetToken; //sử dụng token này để reset password(tăng cường bảo mật)
    // Token để sử dụng trong resetPassword
}
