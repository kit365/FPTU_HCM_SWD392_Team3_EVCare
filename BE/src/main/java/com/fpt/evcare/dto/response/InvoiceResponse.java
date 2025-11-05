package com.fpt.evcare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceResponse {
    UUID invoiceId;
    UUID appointmentId;
    String customerName;
    String customerEmail;
    String customerPhone;
    UUID paymentMethodId;
    String paymentMethodName;
    BigDecimal totalAmount;
    BigDecimal paidAmount;
    String status;
    LocalDateTime invoiceDate;
    LocalDateTime dueDate;
    String notes;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    
    // Appointment details
    String vehicleNumberPlate;
    String vehicleTypeName;
    String vehicleManufacturer;
    String serviceMode;
    LocalDateTime scheduledAt;
    
    // Services and maintenance records summary
    List<MaintenanceManagementSummary> maintenanceDetails;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceManagementSummary {
        String serviceName;
        BigDecimal serviceCost;
        List<PartUsed> partsUsed;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartUsed {
        String partName;
        Integer quantity;
        BigDecimal unitPrice;
        BigDecimal totalPrice;
        BigDecimal originalPrice; // Giá gốc của phụ tùng (trước giảm giá)
        Boolean isUnderWarranty; // Phụ tùng có được bảo hành không
        String warrantyDiscountType; // PERCENTAGE hoặc FREE
        BigDecimal warrantyDiscountValue; // Giá trị giảm giá (% hoặc null nếu FREE)
        BigDecimal warrantyDiscountAmount; // Số tiền được giảm
    }
}
