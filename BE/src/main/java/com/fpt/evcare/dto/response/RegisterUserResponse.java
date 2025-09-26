package com.fpt.evcare.dto.response;

import lombok.*;

import java.util.UUID;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterUserResponse {
    private UUID userId;
    private String email;
    private String token;
}
