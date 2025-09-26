package com.fpt.evcare.dto.request.user;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreationUserRequest {

    UUID userId;

    private List<String> roleIds;

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 20, message = "Username có ít nhất 3 đến 20 kí tự")
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 kí tự")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt")
    @Pattern(regexp = "\\S+", message = "Mật khẩu không được chứa khoảng trắng")
    private String password;

    @Nullable
    String address;

    @Nullable
    String fullName;

    @Nullable
    @Pattern(regexp = "\\d{10}|^$", message = "Số điện thoại phải là 10 chữ số")
    String numberPhone;

    @Nullable
    String avatarUrl;

    @Nullable
    String technicianSkills;
}
