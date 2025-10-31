package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse implements Serializable {

    UUID userId;

    transient List<String> roleName;

    String username;

    String email;

    String address;

    String fullName;

    String numberPhone;

    String avatarUrl;

    String provider;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    String technicianSkills;

    Boolean isActive;

    String lastLogin;

    Boolean isDeleted;

    Boolean isAdmin;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
