package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fpt.evcare.enums.VehiclePartStatusEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VehiclePartSimpleResponse implements Serializable {

    UUID vehiclePartId;

    String vehiclePartName;

    Integer currentQuantity;

    Integer minStock;

    BigDecimal unitPrice;

    VehiclePartStatusEnum status;
}

