package com.fpt.evcare.dto.request;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class RoleRequest implements Serializable {

    UUID roleId;

    @NotBlank(message = "Role name không được để trống")
    String roleName;

    @Nullable
    String description;

    @NotEmpty(message = "Cần phần quyền cho role này")
    private List<String> permissions = new ArrayList<>();

    Boolean isDeleted = false;

}
