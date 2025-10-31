package com.fpt.evcare.dto.request.user;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    
    @Email(message = "Email không hợp lệ")
    @Nullable
    private String email;
    
    @Nullable
    private String fullName;
    
    @Nullable
    @Pattern(regexp = "\\d{10}|^$", message = "Số điện thoại phải là 10 chữ số")
    private String numberPhone;
    
    @Nullable
    private String address;
    
    @Nullable
    private String avatarUrl;
}

