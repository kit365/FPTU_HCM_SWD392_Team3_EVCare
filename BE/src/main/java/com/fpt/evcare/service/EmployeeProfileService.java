package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.employee_profile.CreationEmployeeProfileRequest;
import com.fpt.evcare.dto.request.employee_profile.UpdationEmployeeProfileRequest;
import com.fpt.evcare.dto.response.EmployeeProfileResponse;
import com.fpt.evcare.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface EmployeeProfileService {

    void addEmployeeProfile(CreationEmployeeProfileRequest request);

    EmployeeProfileResponse getEmployeeProfileById(UUID employeeProfileId);

    EmployeeProfileResponse getEmployeeProfileByUserId(UUID userId);

    PageResponse<EmployeeProfileResponse> searchEmployeeProfile(String keyword, Pageable page);

    void updateEmployeeProfile(UUID id, UpdationEmployeeProfileRequest request);

    void deleteEmployeeProfile(UUID employeeProfileId);

    void restoreEmployeeProfile(UUID employeeProfileId);

}
