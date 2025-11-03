package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceTypeResponse implements Serializable {

    UUID serviceTypeId;

    String serviceName;

    String description;
    
    Integer estimatedDurationMinutes; 

    UUID parentId;

    VehicleTypeResponse vehicleTypeResponse;

    Boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    List<ServiceTypeResponse> children; // Thêm danh sách con

    @JsonInclude(JsonInclude.Include.NON_NULL)
    List<ServiceTypeVehiclePartResponse> serviceTypeVehiclePartResponses;
}
