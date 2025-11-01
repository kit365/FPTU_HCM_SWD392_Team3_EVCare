package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WarrantyPackageResponse implements Serializable {

    UUID warrantyPackageId;

    String warrantyPackageName;

    String description;

    Integer warrantyPeriodMonths;

    LocalDateTime startDate;

    LocalDateTime endDate;

    Boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;

    // Optional: Danh sách phụ tùng trong gói bảo hành
    List<WarrantyPackagePartResponse> warrantyPackageParts;
}

