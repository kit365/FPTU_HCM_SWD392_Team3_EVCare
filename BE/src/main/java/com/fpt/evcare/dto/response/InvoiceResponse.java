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
        Boolean isUnderWarranty; // Phụ tùng có bảo hành hay không
        String warrantyPackageName; // Tên gói bảo hành (nếu có)
        BigDecimal originalPrice; // Giá gốc của phụ tùng (trước khi áp dụng bảo hành)
    }
}
