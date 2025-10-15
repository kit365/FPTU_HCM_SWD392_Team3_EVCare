package com.fpt.evcare.dto.request.employee_profile;

import com.fpt.evcare.enums.SkillLevelEnum;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreationEmployeeProfileRequest implements Serializable {

    @NotBlank(message = "Người dùng không được để trống")
    UUID userId;

    @NotBlank(message = "Trình độ kỹ năng ban đầu không được trống")
    SkillLevelEnum skillLevel;

    String certifications;

    @Min(value = 0, message = "Điểm hiệu xuất làm việc không được nhỏ hơn không")
    Float performanceScore;

    @Min(value = 0, message = "Tổng thời gian làm việc không được nhỏ hơn 0h")
    Float totalHoursWorked;
    
    LocalDateTime hireDate;

    Float salaryBase;

    String emergencyContact;

    String notes;

    String search;


}
