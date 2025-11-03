package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fpt.evcare.dto.response.CertificationResponse;
import com.fpt.evcare.enums.SkillLevelEnum;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class EmployeeProfileResponse implements Serializable {
    UUID employeeProfileId;

    UserResponse userId;

    SkillLevelEnum skillLevel;

    List<CertificationResponse> certifications;

    Float performanceScore;

    LocalDateTime hireDate;

    Float salaryBase;

    String emergencyContact;

    String position;

    String notes;

    String search;

    boolean isActive;

    Boolean isDeleted;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
