package com.fpt.evcare.dto.response;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    boolean authenticated;
    String token;
}
