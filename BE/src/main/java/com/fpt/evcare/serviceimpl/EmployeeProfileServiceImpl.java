package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.EmployeeProfileConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.employee_profile.CreationEmployeeProfileRequest;
import com.fpt.evcare.dto.request.employee_profile.UpdationEmployeeProfileRequest;
import com.fpt.evcare.dto.response.EmployeeProfileResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.entity.EmployeeProfileEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.SkillLevelEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.EmployeeProfileMapper;
import com.fpt.evcare.repository.EmployeeProfileRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.EmployeeProfileService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmployeeProfileServiceImpl implements EmployeeProfileService {

    UserRepository userRepository;
    EmployeeProfileRepository employeeProfileRepository;
    EmployeeProfileMapper employeeProfileMapper;

    @Override
    @Transactional
    public void addEmployeeProfile(CreationEmployeeProfileRequest request) {
        UserEntity userEntity = userRepository.findByUserIdAndIsDeletedFalse(request.getUserId());
        if (userEntity == null) {
            log.error("User not found with id: {}", request.getUserId());
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        EmployeeProfileEntity employeeProfileEntity = employeeProfileMapper.toEmployeeProfile(request);
        employeeProfileEntity.setUser(userEntity);
        employeeProfileEntity.setSearch(concatenateSearchField(
                userEntity.getFullName(),
                employeeProfileEntity.getSkillLevel(),
                employeeProfileEntity.getCertifications(),
                employeeProfileEntity.getEmergencyContact()
        ));
        employeeProfileMapper.toEmployeeProfileResponse(employeeProfileRepository.save(employeeProfileEntity));

    }
    private String concatenateSearchField(String fullName, SkillLevelEnum skillLevel, String certifications, String emergencyContact) {
        return String.join("-",
                fullName != null ? fullName : "",
                skillLevel != null ? skillLevel.name() : "",
                certifications != null ? certifications : "",
                emergencyContact != null ? emergencyContact : ""
        );
    }

    @Override
    @Transactional
    public EmployeeProfileResponse getEmployeeProfileById(UUID employeeProfileId) {
        EmployeeProfileEntity employeeProfileEntity = employeeProfileRepository.findByEmployeeProfileIdAndIsDeletedFalse(employeeProfileId);
        if (employeeProfileEntity == null) {
            log.error("Employee profile not found with id: {}", employeeProfileId);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        return employeeProfileMapper.toEmployeeProfileResponse(employeeProfileEntity);
    }

    @Override
    @Transactional
    public PageResponse<EmployeeProfileResponse> searchEmployeeProfile(String keyword, Pageable page) {
        return null;
    }

    @Override
    @Transactional
    public void updateEmployeeProfile(UUID id, UpdationEmployeeProfileRequest request) {
        EmployeeProfileEntity employeeProfileEntity = employeeProfileRepository.findByEmployeeProfileIdAndIsDeletedFalse(id);
        if (employeeProfileEntity == null) {
            log.error("Employee profile not found with id: {}", id);
            throw new ResourceNotFoundException(EmployeeProfileConstants.MESSAGE_ERROR_EMPLOYEE_PROFILE_NOT_FOUND);
        }
        employeeProfileMapper.updateEmployeeProfileFromDto(request, employeeProfileEntity);
        employeeProfileRepository.save(employeeProfileEntity);
    }

    @Override
    @Transactional
    public void deleteEmployeeProfile(UUID employeeProfileId) {
        EmployeeProfileEntity employeeProfileEntity = employeeProfileRepository.findByEmployeeProfileIdAndIsDeletedFalse(employeeProfileId);
        if (employeeProfileEntity == null) {
            log.error("Employee profile not found with id: {}", employeeProfileId);
            throw new ResourceNotFoundException(EmployeeProfileConstants.MESSAGE_ERROR_EMPLOYEE_PROFILE_NOT_FOUND);
        }
        employeeProfileEntity.setIsDeleted(true);
        employeeProfileRepository.save(employeeProfileEntity);

    }

    @Override
    @Transactional
    public void restoreEmployeeProfile(UUID employeeProfileId) {
        EmployeeProfileEntity employeeProfileEntity = employeeProfileRepository.findByEmployeeProfileIdAndIsDeletedTrue(employeeProfileId);
        if (employeeProfileEntity == null) {
            log.error("Employee profile not found with id: {}", employeeProfileId);
            throw new ResourceNotFoundException(EmployeeProfileConstants.MESSAGE_ERROR_EMPLOYEE_PROFILE_NOT_FOUND);
        }
        employeeProfileEntity.setIsDeleted(false);
        employeeProfileRepository.save(employeeProfileEntity);

    }
}
