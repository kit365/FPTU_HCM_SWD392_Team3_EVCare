package com.fpt.evcare.dto.request.employee_profile;

import com.fpt.evcare.dto.response.CertificationResponse;
import com.fpt.evcare.enums.SkillLevelEnum;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationEmployeeProfileRequest implements Serializable {

    @NotNull(message = "Người dùng không được để trống")
    UUID userId;

    @NotNull(message = "Trình độ kỹ năng ban đầu không được trống")
    SkillLevelEnum skillLevel;

    List<CertificationResponse> certifications;

    @Min(value = 0, message = "Điểm hiệu xuất làm việc không được nhỏ hơn không")
    Float performanceScore;

    LocalDateTime hireDate;

    Float salaryBase;

    String emergencyContact;

    String position;

    String notes;

    String search;


}
