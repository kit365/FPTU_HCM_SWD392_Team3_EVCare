package com.fpt.evcare.dto.request.user;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdationUserRequest {

    private List<String> roleIds;

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

    @Nullable
    LocalDateTime lastLogin;

    @Nullable
    boolean isDeleted;

    @Nullable
    String createdBy;

    @Nullable
    String updatedBy;
}
