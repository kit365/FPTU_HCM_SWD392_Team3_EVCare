package com.fpt.evcare.serviceimpl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.evcare.constants.EmployeeProfileConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.employee_profile.CreationEmployeeProfileRequest;
import com.fpt.evcare.dto.request.employee_profile.UpdationEmployeeProfileRequest;
import com.fpt.evcare.dto.response.CertificationResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmployeeProfileServiceImpl implements EmployeeProfileService {

    UserRepository userRepository;
    EmployeeProfileRepository employeeProfileRepository;
    EmployeeProfileMapper employeeProfileMapper;
    ObjectMapper objectMapper;

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
        
        // Convert certifications List to JSON string
        if (request.getCertifications() != null && !request.getCertifications().isEmpty()) {
            try {
                String certificationsJson = objectMapper.writeValueAsString(request.getCertifications());
                employeeProfileEntity.setCertifications(certificationsJson);
            } catch (Exception e) {
                log.error("Error converting certifications to JSON: {}", e.getMessage());
            }
        }
        
        // Extract certification names for search field
        String certificationNames = "";
        if (request.getCertifications() != null && !request.getCertifications().isEmpty()) {
            certificationNames = request.getCertifications().stream()
                    .map(CertificationResponse::getName)
                    .filter(name -> name != null && !name.isEmpty())
                    .collect(java.util.stream.Collectors.joining(" "));
        }
        
        employeeProfileEntity.setSearch(concatenateSearchField(
                userEntity.getFullName(),
                employeeProfileEntity.getSkillLevel(),
                certificationNames,
                employeeProfileEntity.getEmergencyContact(),
                employeeProfileEntity.getPosition()
        ));
        employeeProfileRepository.save(employeeProfileEntity);

    }
    private String concatenateSearchField(String fullName, SkillLevelEnum skillLevel, String certifications, String emergencyContact, String position) {
        return String.join("-",
                fullName != null ? fullName : "",
                skillLevel != null ? skillLevel.name() : "",
                certifications != null ? certifications : "",
                emergencyContact != null ? emergencyContact : "",
                position != null ? position : ""
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
        return convertToResponse(employeeProfileEntity);
    }

    @Override
    @Transactional
    public EmployeeProfileResponse getEmployeeProfileByUserId(UUID userId) {
        EmployeeProfileEntity employeeProfileEntity = employeeProfileRepository.findByUserUserIdAndIsDeletedFalse(userId);
        if (employeeProfileEntity == null) {
            log.error("Employee profile not found for user id: {}", userId);
            throw new ResourceNotFoundException("Không tìm thấy hồ sơ nhân viên cho người dùng này");
        }
        return convertToResponse(employeeProfileEntity);
    }

    private EmployeeProfileResponse convertToResponse(EmployeeProfileEntity employeeProfileEntity) {
        EmployeeProfileResponse response = employeeProfileMapper.toEmployeeProfileResponse(employeeProfileEntity);
        
        // Convert certifications JSON string to List
        if (employeeProfileEntity.getCertifications() != null && !employeeProfileEntity.getCertifications().isEmpty()) {
            try {
                List<CertificationResponse> certifications = objectMapper.readValue(
                    employeeProfileEntity.getCertifications(),
                    new TypeReference<List<CertificationResponse>>() {}
                );
                response.setCertifications(certifications);
            } catch (Exception e) {
                log.error("Error parsing certifications JSON: {}", e.getMessage());
                response.setCertifications(new java.util.ArrayList<>());
            }
        } else {
            response.setCertifications(new java.util.ArrayList<>());
        }
        
        return response;
    }

    @Override
    @Transactional
    public PageResponse<EmployeeProfileResponse> searchEmployeeProfile(String keyword, Pageable pageable) {
        // Đảm bảo không bao giờ throw exception - luôn trả về danh sách rỗng nếu có lỗi
        int pageNum = 0;
        int pageSize = 10;
        
        try {
            if (pageable != null) {
                pageNum = pageable.getPageNumber();
                pageSize = pageable.getPageSize();
            }
        } catch (Exception e) {
            log.warn("Error getting pageable info: {}", e.getMessage());
        }
        
        PageResponse<EmployeeProfileResponse> emptyResponse = PageResponse.<EmployeeProfileResponse>builder()
                .data(List.of())
                .page(pageNum)
                .size(pageSize)
                .totalElements(0)
                .totalPages(0)
                .last(true)
                .build();
        
        try {
            Page<EmployeeProfileEntity> employeeProfileEntityPage;
            
            if (keyword == null || keyword.trim().isEmpty()) {
                employeeProfileEntityPage = employeeProfileRepository.findAllByIsDeletedFalse(pageable);
            } else {
                employeeProfileEntityPage = employeeProfileRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword.trim(), pageable);
            }
            
            // Nếu không có kết quả, trả về page rỗng thay vì throw exception
            if (employeeProfileEntityPage == null || employeeProfileEntityPage.getTotalElements() == 0) {
                log.info("No employee profiles found - returning empty page");
                return emptyResponse;
            }
            
            List<EmployeeProfileResponse> employeeProfileResponseList = employeeProfileEntityPage
                    .getContent()
                    .stream()
                    .map(entity -> {
                        EmployeeProfileResponse response = employeeProfileMapper.toEmployeeProfileResponse(entity);
                        // Convert certifications JSON string to List
                        if (entity.getCertifications() != null && !entity.getCertifications().isEmpty()) {
                            try {
                                List<CertificationResponse> certifications = objectMapper.readValue(
                                    entity.getCertifications(),
                                    new TypeReference<List<CertificationResponse>>() {}
                                );
                                response.setCertifications(certifications);
                            } catch (Exception e) {
                                log.error("Error parsing certifications JSON: {}", e.getMessage());
                                response.setCertifications(new java.util.ArrayList<>());
                            }
                        } else {
                            response.setCertifications(new java.util.ArrayList<>());
                        }
                        return response;
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            log.info("Searching employee profiles with keyword: {}", keyword);
            return PageResponse.<EmployeeProfileResponse>builder()
                    .data(employeeProfileResponseList)
                    .page(employeeProfileEntityPage.getNumber())
                    .size(employeeProfileEntityPage.getSize())
                    .totalElements(employeeProfileEntityPage.getTotalElements())
                    .totalPages(employeeProfileEntityPage.getTotalPages())
                    .last(employeeProfileEntityPage.isLast())
                    .build();
            
        } catch (Throwable t) {
            // Catch cả Error, không chỉ Exception - đảm bảo luôn trả về response hợp lệ
            log.error("Error searching employee profiles: {}", t.getMessage(), t);
            return emptyResponse;
        }
    }

    @Override
    @Transactional
    public void updateEmployeeProfile(UUID id, UpdationEmployeeProfileRequest request) {
        EmployeeProfileEntity employeeProfileEntity = employeeProfileRepository.findByEmployeeProfileIdAndIsDeletedFalse(id);
        if (employeeProfileEntity == null) {
            log.error("Employee profile not found with id: {}", id);
            throw new ResourceNotFoundException(EmployeeProfileConstants.MESSAGE_ERROR_EMPLOYEE_PROFILE_NOT_FOUND);
        }
        
        // Store certifications before clearing from request
        List<CertificationResponse> certificationsToSave = request.getCertifications();
        
        // Convert certifications List to JSON string if provided
        if (certificationsToSave != null) {
            try {
                String certificationsJson = objectMapper.writeValueAsString(certificationsToSave);
                employeeProfileEntity.setCertifications(certificationsJson);
            } catch (Exception e) {
                log.error("Error converting certifications to JSON: {}", e.getMessage());
            }
            // Clear certifications from request to avoid mapper trying to map it as String
            request.setCertifications(null);
        }
        
        employeeProfileMapper.updateEmployeeProfileFromDto(request, employeeProfileEntity);
        
        // Update search field with certification names
        String certificationNames = "";
        if (certificationsToSave != null && !certificationsToSave.isEmpty()) {
            certificationNames = certificationsToSave.stream()
                    .map(CertificationResponse::getName)
                    .filter(name -> name != null && !name.isEmpty())
                    .collect(java.util.stream.Collectors.joining(" "));
        } else if (employeeProfileEntity.getCertifications() != null && !employeeProfileEntity.getCertifications().isEmpty()) {
            try {
                List<CertificationResponse> certs = objectMapper.readValue(
                    employeeProfileEntity.getCertifications(),
                    new TypeReference<List<CertificationResponse>>() {}
                );
                certificationNames = certs.stream()
                        .map(CertificationResponse::getName)
                        .filter(name -> name != null && !name.isEmpty())
                        .collect(java.util.stream.Collectors.joining(" "));
            } catch (Exception e) {
                log.error("Error parsing certifications for search: {}", e.getMessage());
            }
        }
        
        // Always update search field
        employeeProfileEntity.setSearch(concatenateSearchField(
                employeeProfileEntity.getUser().getFullName(),
                employeeProfileEntity.getSkillLevel(),
                certificationNames,
                employeeProfileEntity.getEmergencyContact(),
                employeeProfileEntity.getPosition()
        ));
        
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
