package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AppointmentConstants;
import com.fpt.evcare.constants.RoleConstants;
import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.response.*;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.enums.ServiceModeEnum;
import com.fpt.evcare.exception.AppointmentValidationException;
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

        UserEntity technician = appointmentEntity.getTechnician();
        if(technician != null) {
            UserResponse technicianResponse = mapUserEntityToResponse(technician);
            appointmentResponse.setCustomer(technicianResponse);
        }

        UserEntity assignee = appointmentEntity.getCustomer();
        if(assignee != null) {
            UserResponse assigneeResponse = mapUserEntityToResponse(assignee);
            appointmentResponse.setCustomer(assigneeResponse);
        }

//        List<ServiceTypeVehiclePartResponse> serviceTypeVehiclePartResponses = getServiceTypeResponses(appointmentEntity.getServiceTypes());
//        appointmentResponse.setServiceTypes(serviceTypeResponses);

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


            UserEntity technician = appointmentEntity.getTechnician();
            appointmentResponse.setTechnician(mapUserEntityToResponse(technician));

            UserEntity assignee = appointmentEntity.getAssignee();
            appointmentResponse.setAssignee(mapUserEntityToResponse(assignee));

//            List<ServiceTypeResponse> serviceTypeResponses = getServiceTypeResponses(appointmentEntity.getServiceTypes());
//            appointmentResponse.setServiceTypes(serviceTypeResponses);

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


            UserEntity technician = appointmentEntity.getTechnician();
            appointmentResponse.setTechnician(mapUserEntityToResponse(technician));

            UserEntity assignee = appointmentEntity.getAssignee();
            appointmentResponse.setAssignee(mapUserEntityToResponse(assignee));

//            List<ServiceTypeResponse> serviceTypeResponses = getServiceTypeResponses(appointmentEntity.getServiceTypes());
//            appointmentResponse.setServiceTypes(serviceTypeResponses);

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
//        if(creationAppointmentRequest.getServiceTypeIds().isEmpty()) {
//            log.warn(AppointmentConstants.LOG_ERR_SERVICE_TYPE_IS_REQUIRED);
//            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_SERVICE_TYPE_IS_REQUIRED);
//        }
//
//        AppointmentEntity appointmentEntity = appointmentMapper.toEntity(creationAppointmentRequest);
//
//        UserEntity customer = userRepository.findByUserIdAndIsDeletedFalse(creationAppointmentRequest.getCustomerId());
//        if(customer != null) {
//            checkRoleUser(customer, RoleEnum.CUSTOMER);
//            appointmentEntity.setCustomer(customer);
//        }
//
//        UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(creationAppointmentRequest.getTechnicianId());
//        if(technician != null) {
//            checkRoleUser(technician, RoleEnum.TECHNICIAN);
//            appointmentEntity.setTechnician(technician);
//        }
//
//        UserEntity assignee = userRepository.findByUserIdAndIsDeletedFalse(creationAppointmentRequest.getAssigneeId());
//        if(assignee != null) {
//            checkRoleUser(assignee, RoleEnum.STAFF);
//            appointmentEntity.setAssignee(assignee);
//        }
//
//        isValidServiceMode(creationAppointmentRequest.getServiceMode());
//        appointmentEntity.setServiceMode(creationAppointmentRequest.getServiceMode());
//
//        isValidAppointmentStatus(creationAppointmentRequest.getStatus());
//        appointmentEntity.setStatus(creationAppointmentRequest.getStatus());
//
//        List<ServiceTypeEntity> serviceTypeEntityList = creationAppointmentRequest.getServiceTypeIds().stream().map(serviceTypeId -> {
//            ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(serviceTypeId);
//            if(serviceType == null) {
//                log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND + serviceTypeId);
//                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
//            } else if(serviceType.getParent() == null){
//                log.warn(ServiceTypeConstants.LOG_ERR_CHOOSING_NOT_SPECIFIC_SERVICE_TYPE + serviceTypeId);
//                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_CHOOSING_NOT_SPECIFIC_SERVICE_TYPE);
//            }
//            return serviceType;
//        }).toList();
//        appointmentEntity.setServiceTypes(serviceTypeEntityList);
//
//        String customerSearch = customer != null ? customer.getSearch() : "";
//        String technicianSearch = technician != null ? technician.getSearch() : "";
//        String assigneeSearch = assignee != null ? assignee.getSearch() : "";
//
//        String search = concatenateSearchField(
//                creationAppointmentRequest.getCustomerFullName(),
//                creationAppointmentRequest.getCustomerPhoneNumber(),
//                creationAppointmentRequest.getCustomerEmail(),
//                customerSearch,
//                technicianSearch,
//                assigneeSearch
//        );
//
//        appointmentEntity.setSearch(search);
//
//        log.info(AppointmentConstants.LOG_INFO_CREATING_APPOINTMENT);
//        appointmentRepository.save(appointmentEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateAppointment(UUID id, UpdationAppointmentRequest updationAppointmentRequest) {
//        if(updationAppointmentRequest.getServiceTypeIds().isEmpty()) {
//            log.warn(AppointmentConstants.LOG_ERR_SERVICE_TYPE_IS_REQUIRED);
//            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_SERVICE_TYPE_IS_REQUIRED);
//        }

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

        UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(updationAppointmentRequest.getAssigneeId());
        if(technician != null) {
            checkRoleUser(technician, RoleEnum.TECHNICIAN);
            appointmentEntity.setTechnician(technician);
        }

        UserEntity assignee = userRepository.findByUserIdAndIsDeletedFalse(updationAppointmentRequest.getAssigneeId());
        if(assignee != null) {
            checkRoleUser(assignee, RoleEnum.STAFF);
            appointmentEntity.setAssignee(assignee);
        }

        isValidServiceMode(updationAppointmentRequest.getServiceMode());
        appointmentEntity.setServiceMode(updationAppointmentRequest.getServiceMode());

        isValidAppointmentStatus(updationAppointmentRequest.getStatus());
        appointmentEntity.setStatus(updationAppointmentRequest.getStatus());

//        List<ServiceTypeEntity> serviceTypeEntityList = updationAppointmentRequest.getServiceTypeIds().stream().map(serviceTypeId -> {
//            ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(serviceTypeId);
//            if(serviceType == null) {
//                log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND + serviceTypeId);
//                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
//            } else if(serviceType.getParent() == null){
//                log.warn(ServiceTypeConstants.LOG_ERR_CHOOSING_NOT_SPECIFIC_SERVICE_TYPE + serviceTypeId);
//                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_CHOOSING_NOT_SPECIFIC_SERVICE_TYPE);
//            }
//            return serviceType;
//        }).toList();
//        appointmentEntity.setServiceTypes(serviceTypeEntityList);

        String customerSearch = customer != null ? customer.getSearch() : "";
        String technicianSearch = technician != null ? technician.getSearch() : "";
        String assigneeSearch = assignee != null ? assignee.getSearch() : "";

        String search = concatenateSearchField(
                updationAppointmentRequest.getCustomerFullName(),
                updationAppointmentRequest.getCustomerPhoneNumber(),
                updationAppointmentRequest.getCustomerEmail(),
                customerSearch,
                technicianSearch,
                assigneeSearch
        );

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

    private String concatenateSearchField(String customerFullName,
                                          String customerPhoneNumber,
                                          String customerEmail,
                                          String customerSearch,
                                          String techicianSearch,
                                          String assigneeSearch) {
        return String.join("-",
                customerFullName != null ? customerFullName : "",
                customerPhoneNumber != null ? customerPhoneNumber : "",
                customerEmail != null ? customerEmail : "",
                customerSearch != null ? customerSearch : "",
                techicianSearch != null ? techicianSearch : "",
                assigneeSearch != null ? assigneeSearch : ""
        );
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

//    private List<ServiceTypeResponse> getServiceTypeResponses(List<ServiceTypeEntity> serviceTypeEntityList){
//        Set<ServiceTypeEntity> allServiceTypes = new HashSet<>(serviceTypeEntityList);
//
//        // Thêm cha của mỗi service nếu có
//        for (ServiceTypeEntity st : serviceTypeEntityList) {
//            ServiceTypeEntity parent = st.getParent();
//            while (parent != null) {
//                allServiceTypes.add(parent);
//                parent = parent.getParent();
//            }
//        }
//
//        // map sang response
//        Map<UUID, ServiceTypeResponse> serviceTypeMap = new HashMap<>();
//        allServiceTypes.forEach(serviceType -> {
//            ServiceTypeResponse response = new ServiceTypeResponse();
//            response.setServiceTypeId(serviceType.getServiceTypeId());
//            response.setServiceName(serviceType.getServiceName());
//
//            ServiceTypeEntity parent = serviceType.getParent();
//            if(parent != null){
//                response.setParentId(parent.getServiceTypeId());
//            }
//
//            // Response thêm phụ tùng được sử dụng trong dịch vụ đó
//            List<ServiceTypeVehiclePartResponse> vehiclePartResponses = serviceTypeVehiclePartService.getVehiclePartByServiceTypeId(serviceType.getServiceTypeId());
//            response.setServiceTypeVehiclePartResponses(vehiclePartResponses.isEmpty() ? null : vehiclePartResponses);
//
//            serviceTypeMap.put(response.getServiceTypeId(), response);
//        });
//
//        // build cây cha - con
//        List<ServiceTypeResponse> serviceTypeNodes = new ArrayList<>();
//        serviceTypeMap.forEach((uuid, serviceTypeResponse) -> {
//            if (serviceTypeResponse.getParentId() == null) {
//                serviceTypeNodes.add(serviceTypeResponse);
//            } else {
//                ServiceTypeResponse parent = serviceTypeMap.get(serviceTypeResponse.getParentId());
//                if (parent != null) {
//                    if (parent.getChildren() == null) parent.setChildren(new ArrayList<>());
//                    parent.getChildren().add(serviceTypeResponse);
//                }
//            }
//        });
//
//        return serviceTypeNodes;
//    }

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
