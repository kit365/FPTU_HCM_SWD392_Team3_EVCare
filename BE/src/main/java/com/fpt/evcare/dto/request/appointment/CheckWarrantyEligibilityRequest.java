package com.fpt.evcare.dto.request.appointment;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckWarrantyEligibilityRequest implements Serializable {
    
    UUID customerId; // Customer ID nếu là khách hàng đã đăng nhập
    
    String customerEmail; // Email của khách hàng
    
    String customerPhoneNumber; // Số điện thoại của khách hàng
    
    String customerFullName; // Tên đầy đủ của khách hàng
}

