package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;
import java.util.UUID;
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeResponse {
    UUID userId;
    private List<String> roleName;
    String email;
    String address;
    String fullName;
    String numberPhone;
    String avatarUrl;
    String lastLogin;
    Boolean isDeleted;

}
