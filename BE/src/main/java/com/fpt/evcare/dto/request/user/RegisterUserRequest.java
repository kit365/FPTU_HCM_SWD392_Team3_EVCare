package com.fpt.evcare.dto.request.user;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class RegisterUserRequest {
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 20, message = "Username có ít nhất 3 đến 20 kí tự")
    private String username;

    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 kí tự")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt")
    @Pattern(regexp = "\\S+", message = "Mật khẩu không được chứa khoảng trắng")
    private String password;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ và tên phải có từ 2 đến 100 ký tự")
    private String fullName;

    @Nullable
    @Pattern(regexp = "\\d{10}|^$", message = "Số điện thoại phải là 10 chữ số")
    private String numberPhone;

    @Nullable
    private String avatarUrl;

    @Nullable
    private String provider;

}
