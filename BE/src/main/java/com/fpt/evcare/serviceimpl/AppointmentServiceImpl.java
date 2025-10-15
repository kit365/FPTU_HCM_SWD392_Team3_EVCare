package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.*;
import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.response.*;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.enums.ServiceModeEnum;
import com.fpt.evcare.exception.AppointmentValidationException;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.AppointmentMapper;
import com.fpt.evcare.mapper.ServiceTypeMapper;
import com.fpt.evcare.mapper.ServiceTypeVehiclePartMapper;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.ServiceTypeRepository;
import com.fpt.evcare.repository.ServiceTypeVehiclePartRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.AppointmentService;
import com.fpt.evcare.service.ServiceTypeService;
import com.fpt.evcare.service.ServiceTypeVehiclePartService;
import com.fpt.evcare.service.UserService;
import com.fpt.evcare.utils.UtilFunction;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.MessageFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentServiceImpl implements AppointmentService {

    ServiceTypeVehiclePartService serviceTypeVehiclePartService;
    AppointmentRepository appointmentRepository;
    AppointmentMapper appointmentMapper;
    ServiceTypeRepository serviceTypeRepository;
    ServiceTypeMapper serviceTypeMapper;
    UserRepository userRepository;
    ServiceTypeVehiclePartRepository serviceTypeVehiclePartRepository;
    ServiceTypeVehiclePartMapper serviceTypeVehiclePartMapper;
    ServiceTypeService serviceTypeService;

    @Override
    public AppointmentResponse getAppointmentById(UUID id) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

        UserEntity customer = appointmentEntity.getCustomer();
        if(customer != null) {
            UserResponse customerResponse = mapUserEntityToResponse(customer);
            appointmentResponse.setCustomer(customerResponse);
        }

        appointmentEntity.getTechnicianEntities().forEach(technicianEntity -> {
            UserResponse technicianResponse = mapUserEntityToResponse(technicianEntity);
            appointmentResponse.getTechnicianResponses().add(technicianResponse);
        });

        UserEntity assignee = appointmentEntity.getCustomer();
        if(assignee != null) {
            UserResponse assigneeResponse = mapUserEntityToResponse(assignee);
            appointmentResponse.setCustomer(assigneeResponse);
        }

        List<ServiceTypeResponse> serviceTypeResponses = appointmentEntity.getServiceTypeEntities().stream().map(serviceTypeEntity ->
             serviceTypeService.getServiceTypeById(serviceTypeEntity.getServiceTypeId())
        ).collect(Collectors.toList());
        appointmentResponse.setServiceTypeResponses(serviceTypeResponses);

        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT + id);
        return appointmentResponse;
    }

    @Override
    public PageResponse<AppointmentResponse> getAppointmentsByUserId(UUID userId, Pageable pageable){
        UserEntity userEntity =  userRepository.findByUserIdAndIsDeletedFalse(userId);
        if(userEntity == null) {
            log.warn(UserConstants.LOG_ERR_USER_NOT_FOUND + userId);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        //Kiểm tra role của User, từ đó show ra danh sách appointment của loại user đó
        String userType = "";
        if(isExistedUserRole(userEntity, RoleEnum.CUSTOMER)){
            userType = AppointmentConstants.CUSTOMER_ROLE;
        } else if(isExistedUserRole(userEntity, RoleEnum.TECHNICIAN)){
            userType = AppointmentConstants.TECHNICIAN_ROLE;
        } else if(isExistedUserRole(userEntity, RoleEnum.STAFF)){
            userType = AppointmentConstants.ASSIGNEE_ROLE;
        }

        Page<AppointmentEntity> appointmentEntityPage = appointmentRepository.findByCustomerIdAndIsDeletedFalse(userId, pageable, userType);

        if(appointmentEntityPage == null || appointmentEntityPage.getTotalElements() == 0) {
            log.warn(AppointmentConstants.LOG_ERR_USER_APPOINTMENT_NOT_FOUND + userId);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_USER_APPOINTMENT_NOT_FOUND);
        }

        List<AppointmentResponse> appointmentResponseList = appointmentEntityPage.map(appointmentEntity -> {
            AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

            UserEntity customer = appointmentEntity.getCustomer();
            appointmentResponse.setCustomer(mapUserEntityToResponse(customer));


            appointmentEntity.getTechnicianEntities().forEach(technicianEntity -> {
                UserResponse technicianResponse = mapUserEntityToResponse(technicianEntity);
                appointmentResponse.getTechnicianResponses().add(technicianResponse);
            });

            UserEntity assignee = appointmentEntity.getAssignee();
            appointmentResponse.setAssignee(mapUserEntityToResponse(assignee));

            return appointmentResponse;
        }).getContent();

        log.info(AppointmentConstants.LOG_INFO_SHOWING_USER_APPOINTMENT + userId);
        return PageResponse.<AppointmentResponse>builder()
                .data(appointmentResponseList)
                .page(appointmentEntityPage.getNumber())
                .totalElements(appointmentEntityPage.getTotalElements())
                .totalPages(appointmentEntityPage.getTotalPages())
                .build();
    }

    @Override
    public PageResponse<AppointmentResponse> searchAppointment(String keyword, Pageable pageable) {
        Page<AppointmentEntity> appointmentEntityPage;

        if(keyword == null || keyword.isEmpty()) {
            appointmentEntityPage = appointmentRepository.findByIsDeletedFalse(pageable);
        } else {
            appointmentEntityPage = appointmentRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }

        if(appointmentEntityPage == null || appointmentEntityPage.getTotalElements() == 0) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_LIST_NOT_FOUND);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_LIST_NOT_FOUND);
        }

        List<AppointmentResponse> appointmentResponseList = appointmentEntityPage.map(appointmentEntity -> {
            AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

            UserEntity customer = appointmentEntity.getCustomer();
            appointmentResponse.setCustomer(mapUserEntityToResponse(customer));

            appointmentEntity.getTechnicianEntities().forEach(technicianEntity -> {
                UserResponse technicianResponse = mapUserEntityToResponse(technicianEntity);
                appointmentResponse.getTechnicianResponses().add(technicianResponse);
            });

            UserEntity assignee = appointmentEntity.getAssignee();
            appointmentResponse.setAssignee(mapUserEntityToResponse(assignee));

            List<ServiceTypeResponse> serviceTypeResponses = appointmentEntity.getServiceTypeEntities().stream().map(serviceTypeEntity ->
                            serviceTypeService.getServiceTypeById(serviceTypeEntity.getServiceTypeId())
            ).collect(Collectors.toList());
            appointmentResponse.setServiceTypeResponses(serviceTypeResponses);

            return appointmentResponse;
                }
        ).getContent();

        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT_LIST);
        return PageResponse.<AppointmentResponse>builder()
                .data(appointmentResponseList)
                .page(appointmentEntityPage.getNumber())
                .totalElements(appointmentEntityPage.getTotalElements())
                .totalPages(appointmentEntityPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public boolean addAppointment(CreationAppointmentRequest creationAppointmentRequest) {
        if(creationAppointmentRequest.getServiceTypeIds().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_TYPE_IS_REQUIRED);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_SERVICE_TYPE_IS_REQUIRED);
        }

        AppointmentEntity appointmentEntity = appointmentMapper.toEntity(creationAppointmentRequest);

        UserEntity customer = userRepository.findByUserIdAndIsDeletedFalse(creationAppointmentRequest.getCustomerId());
        if(customer != null) {
            checkRoleUser(customer, RoleEnum.CUSTOMER);
            appointmentEntity.setCustomer(customer);
        }

        // Thêm thông tin của các kỹ thuật viên vào cuộc hẹn
        List<UserEntity> technicians = creationAppointmentRequest.getTechnicianId().stream().map(technicianId -> {
            UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(technicianId);
            if(technician != null) {
                checkRoleUser(technician, RoleEnum.TECHNICIAN);
            }

            return technician;
        }).collect(Collectors.toList());
        appointmentEntity.setTechnicianEntities(technicians);

        UserEntity assignee = userRepository.findByUserIdAndIsDeletedFalse(creationAppointmentRequest.getAssigneeId());
        if(assignee != null) {
            checkRoleUser(assignee, RoleEnum.STAFF);
            appointmentEntity.setAssignee(assignee);
        }

        isValidServiceMode(creationAppointmentRequest.getServiceMode());
        appointmentEntity.setServiceMode(creationAppointmentRequest.getServiceMode());

        isValidAppointmentStatus(creationAppointmentRequest.getStatus());
        appointmentEntity.setStatus(creationAppointmentRequest.getStatus());

        List<ServiceTypeEntity> serviceTypeEntityList = creationAppointmentRequest.getServiceTypeIds().stream().map(serviceTypeId -> {
            ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(serviceTypeId);
            if(serviceType == null) {
                log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND + serviceTypeId);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
            } else if(serviceType.getParent() == null){
                log.warn(ServiceTypeConstants.LOG_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE + serviceTypeId);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE);
            }
            return serviceType;
        }).toList();
        appointmentEntity.setServiceTypeEntities(serviceTypeEntityList);

        // Lấy ra thông tin của cách kỹ thuật viên
        String techniciansSearch = concatTechnicianSearchField(appointmentEntity);

        //Ghép các thông tin lại
        String search = UtilFunction.concatenateSearchField(appointmentEntity.getCustomerFullName(),
                appointmentEntity.getCustomerEmail(),
                appointmentEntity.getCustomerPhoneNumber(),
                customer != null ? customer.getSearch() : "",
                techniciansSearch,
                assignee != null ? assignee.getSearch() : "")
                ;
        appointmentEntity.setSearch(search);

        log.info(AppointmentConstants.LOG_INFO_CREATING_APPOINTMENT);
        appointmentRepository.save(appointmentEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateAppointment(UUID id, UpdationAppointmentRequest updationAppointmentRequest) {
        if(updationAppointmentRequest.getServiceTypeIds().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_TYPE_IS_REQUIRED);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_SERVICE_TYPE_IS_REQUIRED);
        }

        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }
        appointmentMapper.toUpdate(appointmentEntity, updationAppointmentRequest);

        UserEntity customer = userRepository.findByUserIdAndIsDeletedFalse(updationAppointmentRequest.getCustomerId());
        if(customer != null) {
            checkRoleUser(customer, RoleEnum.CUSTOMER);
            appointmentEntity.setCustomer(customer);
        }

        // Thêm thông tin của các kỹ thuật viên vào cuộc hẹn
        List<UserEntity> technicians = updationAppointmentRequest.getTechnicianId().stream().map(technicianId -> {
            UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(technicianId);
            if(technician != null) {
                checkRoleUser(technician, RoleEnum.TECHNICIAN);
            }

            return technician;
        }).collect(Collectors.toList());
        appointmentEntity.setTechnicianEntities(technicians);


        UserEntity assignee = userRepository.findByUserIdAndIsDeletedFalse(updationAppointmentRequest.getAssigneeId());
        if(assignee != null) {
            checkRoleUser(assignee, RoleEnum.STAFF);
            appointmentEntity.setAssignee(assignee);
        }

        isValidServiceMode(updationAppointmentRequest.getServiceMode());
        appointmentEntity.setServiceMode(updationAppointmentRequest.getServiceMode());

        isValidAppointmentStatus(updationAppointmentRequest.getStatus());
        appointmentEntity.setStatus(updationAppointmentRequest.getStatus());

        List<ServiceTypeEntity> serviceTypeEntityList = updationAppointmentRequest.getServiceTypeIds().stream().map(serviceTypeId -> {
            ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(serviceTypeId);
            if(serviceType == null) {
                log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND + serviceTypeId);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
            } else if(serviceType.getParent() == null){
                log.warn(ServiceTypeConstants.LOG_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE + serviceTypeId);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE);
            }
            return serviceType;
        }).toList();
        appointmentEntity.setServiceTypeEntities(serviceTypeEntityList);


        // Lấy ra thông tin của cách kỹ thuật viên
        String techniciansSearch = concatTechnicianSearchField(appointmentEntity);

        //Ghép các thông tin lại
        String search = UtilFunction.concatenateSearchField(appointmentEntity.getCustomerFullName(),
                appointmentEntity.getCustomerEmail(),
                appointmentEntity.getCustomerPhoneNumber(),
                customer != null ? customer.getSearch() : "",
                techniciansSearch,
                assignee != null ? assignee.getSearch() : "")
                ;
        appointmentEntity.setSearch(search);

        log.info(AppointmentConstants.LOG_INFO_UPDATING_APPOINTMENT, id);
        appointmentRepository.save(appointmentEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateAppointmentStatus(UUID id, AppointmentStatusEnum statusEnum){
        isValidAppointmentStatus(statusEnum);

        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND + id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }
        appointmentEntity.setStatus(statusEnum);

        log.info(AppointmentConstants.LOG_INFO_UPDATING_APPOINTMENT, statusEnum);
        appointmentRepository.save(appointmentEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteAppointment(UUID id) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND + id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        appointmentEntity.setIsDeleted(true);

        log.info(AppointmentConstants.LOG_INFO_DELETING_APPOINTMENT + id);
        appointmentRepository.save(appointmentEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean restoreAppointment(UUID id) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND + id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        appointmentEntity.setIsDeleted(false);

        log.info(AppointmentConstants.LOG_INFO_RESTORING_APPOINTMENT + id);
        appointmentRepository.save(appointmentEntity);
        return true;
    }

    private UserResponse mapUserEntityToResponse(UserEntity userEntity){
        UserResponse userResponse = new UserResponse();
        if(userEntity != null) {
            userResponse.setUserId(userEntity.getUserId());
            userResponse.setFullName(userEntity.getFullName());
            userResponse.setNumberPhone(userEntity.getNumberPhone());
            userResponse.setEmail(userEntity.getEmail());

            List<String> roleNames = userEntity.getRoles().stream()
                    .map(role -> role.getRoleName() != null ? role.getRoleName().name() : null)
                    .filter(Objects::nonNull)
                    .toList();
            userResponse.setRoleName(roleNames);
        }
        return userResponse;
    }

    private String concatTechnicianSearchField(AppointmentEntity appointmentEntity){
        return appointmentEntity.getTechnicianEntities().stream()
                .map(UserEntity::getSearch) // lấy thuộc tính search
                .filter(Objects::nonNull) // loại null nếu có
                .collect(Collectors.joining("-")
                ); // ghép chuỗi bằng dấu "-"
    }

    private boolean isExistedUserRole(UserEntity userEntity, RoleEnum role) {
        if (userEntity == null || userEntity.getRoles() == null) {
            return false;
        }
        return userEntity.getRoles().stream()
                .anyMatch(userRole -> userRole.getRoleName() != null && userRole.getRoleName().name().equals(role.name()));
    }

    private void checkRoleUser(UserEntity userEntity, RoleEnum roleEnum) {
        boolean hasRole = userEntity.getRoles().stream().anyMatch(
                role -> roleEnum.name().equalsIgnoreCase(role.getRoleName().toString())
        );

        if (!hasRole) {
            log.warn(UserConstants.LOG_ERR_USER_ROLE_NOT_PROPER);
            throw new AppointmentValidationException(UserConstants.MESSAGE_ERR_USER_ROLE_NOT_PROPER);
        }

        log.info(UserConstants.LOG_SUCCESS_VALIDATION_USER_ROLE, roleEnum.name());
    }

    private void isValidServiceMode(ServiceModeEnum serviceModeEnum) {
        if (serviceModeEnum == null || !List.of(ServiceModeEnum.values()).contains(serviceModeEnum)) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_MODE_ENUM_NOT_MATCH + serviceModeEnum);
            throw new AppointmentValidationException(AppointmentConstants.MESSAGE_ERR_SERVICE_MODE_ENUM_NOT_MATCH);
        }
    }

    private void isValidAppointmentStatus(AppointmentStatusEnum statusEnum) {
        if (statusEnum == null || !List.of(AppointmentStatusEnum.values()).contains(statusEnum)) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_STATUS_NOT_MATCH + statusEnum);
            throw new AppointmentValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_STATUS_NOT_MATCH);
        }
    }
}
