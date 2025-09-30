package com.fpt.evcare.dto.response;

import lombok.*;
        import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TokenResponse {
    String token;
    Boolean authorized;
}
