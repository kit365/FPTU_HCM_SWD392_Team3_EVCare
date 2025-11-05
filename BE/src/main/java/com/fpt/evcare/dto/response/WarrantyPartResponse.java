package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fpt.evcare.enums.ValidityPeriodUnitEnum;
import com.fpt.evcare.enums.WarrantyDiscountTypeEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class WarrantyPartResponse implements Serializable {

    UUID warrantyPartId;

    VehiclePartResponse vehiclePart;

    WarrantyDiscountTypeEnum discountType;

    BigDecimal discountValue;

    Integer validityPeriod;

    ValidityPeriodUnitEnum validityPeriodUnit;

    Boolean isDeleted;

    Boolean isActive;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
