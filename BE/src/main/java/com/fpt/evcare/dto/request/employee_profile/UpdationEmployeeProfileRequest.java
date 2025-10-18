package com.fpt.evcare.dto.request.employee_profile;

import com.fpt.evcare.enums.SkillLevelEnum;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationEmployeeProfileRequest implements Serializable {

    SkillLevelEnum skillLevel;

    String certifications;

    Float performanceScore;

    Float totalHoursWorked;

    Float salaryBase;

    String emergencyContact;

    String notes;

    String search;
}
