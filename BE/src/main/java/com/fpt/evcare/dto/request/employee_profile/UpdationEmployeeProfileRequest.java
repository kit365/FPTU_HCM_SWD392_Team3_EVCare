package com.fpt.evcare.dto.request.employee_profile;

import com.fpt.evcare.dto.response.CertificationResponse;
import com.fpt.evcare.enums.SkillLevelEnum;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdationEmployeeProfileRequest implements Serializable {

    SkillLevelEnum skillLevel;

    List<CertificationResponse> certifications;

    Float performanceScore;

    Float salaryBase;

    String emergencyContact;

    String position;

    String notes;

    String search;
}
