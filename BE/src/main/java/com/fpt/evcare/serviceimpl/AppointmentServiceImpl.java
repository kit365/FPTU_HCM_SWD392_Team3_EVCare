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
import com.fpt.evcare.repository.*;
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

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
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
    UserRepository userRepository;
    VehiclePartRepository vehiclePartRepository;
    VehicleTypeRepository vehicleTypeRepository;

    @Override
    public List<String> getAllServiceMode(){
        log.info(AppointmentConstants.LOG_INFO_SHOWING_SERVICE_MODE_LIST);
        return UtilFunction.getEnumValues(ServiceModeEnum.class);
    }

    @Override
    public List<String> getAllStatus(){
        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT_STATUS_LIST);
        return UtilFunction.getEnumValues(AppointmentStatusEnum.class);
    }

    @Override
    public AppointmentResponse getAppointmentById(UUID id) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

        UserEntity customer = appointmentEntity.getCustomer();
        appointmentResponse.setCustomer(mapUserEntityToResponse(customer));

        List<UserResponse> technicianEntities = new ArrayList<>();
        appointmentEntity.getTechnicianEntities().forEach(technicianEntity -> {
            UserResponse technicianResponse = mapUserEntityToResponse(technicianEntity);
            technicianEntities.add(technicianResponse);
        });
        appointmentResponse.setTechnicianResponses(technicianEntities);

        UserEntity assignee = appointmentEntity.getAssignee();
        appointmentResponse.setAssignee(mapUserEntityToResponse(assignee));

        //Lấy những dịch vụ có trong cuộc hẹn
        appointmentResponse.setServiceTypeResponses(getServiceTypeResponsesForAppointment(appointmentEntity));

        VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
        if(appointmentEntity.getVehicleTypeEntity() != null) {
            vehicleTypeResponse.setVehicleTypeId(appointmentEntity.getVehicleTypeEntity().getVehicleTypeId());
            vehicleTypeResponse.setVehicleTypeName(appointmentEntity.getVehicleTypeEntity().getVehicleTypeName());
            vehicleTypeResponse.setBatteryCapacity(appointmentEntity.getVehicleTypeEntity().getBatteryCapacity());
            vehicleTypeResponse.setMaintenanceIntervalKm(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalKm());
            vehicleTypeResponse.setMaintenanceIntervalMonths(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalMonths());
            vehicleTypeResponse.setManufacturer(appointmentEntity.getVehicleTypeEntity().getManufacturer());
            vehicleTypeResponse.setModelYear(appointmentEntity.getVehicleTypeEntity().getModelYear());
        }
        appointmentResponse.setVehicleTypeResponse(vehicleTypeResponse);

        // Nếu dịch vụ đó không còn tồn tại, giá tạm tính phải mất
        if(appointmentResponse.getServiceTypeResponses().isEmpty()) {
            appointmentResponse.setQuotePrice(BigDecimal.ZERO);
        } else {
            appointmentResponse.setQuotePrice(appointmentEntity.getQuotePrice());
        }

        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT + id);
        return appointmentResponse;
    }

    @Override
    public PageResponse<AppointmentResponse> getAppointmentsByUserId(UUID userId, String keyword, Pageable pageable){
        UserEntity userEntity =  userRepository.findByUserIdAndIsDeletedFalse(userId);
        if(userEntity == null) {
            log.warn(UserConstants.LOG_ERR_USER_NOT_FOUND + userId);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        Page<AppointmentEntity> appointmentEntityPage = appointmentRepository.findAppointmentsByCustomerAndKeyword(userId, keyword, pageable);

        if(appointmentEntityPage == null || appointmentEntityPage.getTotalElements() == 0) {
            log.warn(AppointmentConstants.LOG_ERR_USER_APPOINTMENT_NOT_FOUND + userId);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_USER_APPOINTMENT_NOT_FOUND);
        }

        List<AppointmentResponse> appointmentResponseList = appointmentEntityPage.map(appointmentEntity -> {
            AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

            UserEntity customer = appointmentEntity.getCustomer();
            appointmentResponse.setCustomer(mapUserEntityToResponse(customer));

            List<UserResponse> technicianEntities = new ArrayList<>();
            appointmentEntity.getTechnicianEntities().forEach(technicianEntity -> {
                UserResponse technicianResponse = mapUserEntityToResponse(technicianEntity);
                technicianEntities.add(technicianResponse);
            });
            appointmentResponse.setTechnicianResponses(technicianEntities);

            UserEntity assignee = appointmentEntity.getAssignee();
            appointmentResponse.setAssignee(mapUserEntityToResponse(assignee));

            //Lấy những dịch vụ có trong cuộc hẹn
            appointmentResponse.setServiceTypeResponses(getServiceTypeResponsesForAppointment(appointmentEntity));

            VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
            if(appointmentEntity.getVehicleTypeEntity() != null) {
                vehicleTypeResponse.setVehicleTypeId(appointmentEntity.getVehicleTypeEntity().getVehicleTypeId());
                vehicleTypeResponse.setVehicleTypeName(appointmentEntity.getVehicleTypeEntity().getVehicleTypeName());
                vehicleTypeResponse.setManufacturer(appointmentEntity.getVehicleTypeEntity().getManufacturer());
                vehicleTypeResponse.setModelYear(appointmentEntity.getVehicleTypeEntity().getModelYear());
            }
            appointmentResponse.setVehicleTypeResponse(vehicleTypeResponse);

            // Nếu dịch vụ đó không còn tồn tại, giá tạm tính phải mất
            if(appointmentResponse.getServiceTypeResponses().isEmpty()) {
                appointmentResponse.setQuotePrice(BigDecimal.ZERO);
            } else {
                appointmentResponse.setQuotePrice(appointmentEntity.getQuotePrice());
            }

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

            List<UserResponse> technicianEntities = new ArrayList<>();
            appointmentEntity.getTechnicianEntities().forEach(technicianEntity -> {
                UserResponse technicianResponse = mapUserEntityToResponse(technicianEntity);
                technicianEntities.add(technicianResponse);
            });
            appointmentResponse.setTechnicianResponses(technicianEntities);

            UserEntity assignee = appointmentEntity.getAssignee();
            appointmentResponse.setAssignee(mapUserEntityToResponse(assignee));

            //Lấy những dịch vụ có trong cuộc hẹn
            appointmentResponse.setServiceTypeResponses(getServiceTypeResponsesForAppointment(appointmentEntity));

            VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
            if(appointmentEntity.getVehicleTypeEntity() != null) {
                vehicleTypeResponse.setVehicleTypeId(appointmentEntity.getVehicleTypeEntity().getVehicleTypeId());
                vehicleTypeResponse.setVehicleTypeName(appointmentEntity.getVehicleTypeEntity().getVehicleTypeName());
                vehicleTypeResponse.setManufacturer(appointmentEntity.getVehicleTypeEntity().getManufacturer());
                vehicleTypeResponse.setModelYear(appointmentEntity.getVehicleTypeEntity().getModelYear());
            }
            appointmentResponse.setVehicleTypeResponse(vehicleTypeResponse);

            // Nếu dịch vụ đó không còn tồn tại, giá tạm tính phải mất
            if(appointmentResponse.getServiceTypeResponses().isEmpty()) {
                appointmentResponse.setQuotePrice(BigDecimal.ZERO);
            } else {
                appointmentResponse.setQuotePrice(appointmentEntity.getQuotePrice());
            }

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
        //Kiểm tra trong cuộc hẹn đã có kỹ thuật viên đó chưa
        Set<UUID> technicianIdList = new HashSet<>();
        List<UserEntity> technicians = new ArrayList<>();
        creationAppointmentRequest.getTechnicianId().forEach(technicianId -> {
            UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(technicianId);

            //Kiểm tra kỹ thuật viên đó có tồn tại hay không và có bị add trùng không
            if(technician != null && !technicianIdList.contains(technicianId)) {
                checkRoleUser(technician, RoleEnum.TECHNICIAN);
                technicianIdList.add(technicianId);
                technicians.add(technician);
            }
        });
        if(!technicians.isEmpty()) {
            appointmentEntity.setTechnicianEntities(technicians);
        }

        UserEntity assignee = userRepository.findByUserIdAndIsDeletedFalse(creationAppointmentRequest.getAssigneeId());
        if(assignee != null) {
            checkRoleUser(assignee, RoleEnum.STAFF);
            appointmentEntity.setAssignee(assignee);
        }

        ServiceModeEnum serviceModeEnum = isValidServiceMode(creationAppointmentRequest.getServiceMode());
        appointmentEntity.setServiceMode(serviceModeEnum);

        AppointmentStatusEnum status = isValidAppointmentStatus(creationAppointmentRequest.getStatus());
        appointmentEntity.setStatus(status);

        // Set loại dịch vụ được chọn trong bảng
        List<ServiceTypeEntity> serviceTypeEntityList = creationAppointmentRequest.getServiceTypeIds().stream().map(serviceTypeId -> {
            ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(serviceTypeId);
            if(serviceType == null) {
                log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND + serviceTypeId);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
            } else if(serviceType.getParentId() == null){
                log.warn(ServiceTypeConstants.LOG_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE + serviceTypeId);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE);
            }
            return serviceType;
        }).collect(Collectors.toList());
        appointmentEntity.setServiceTypeEntities(serviceTypeEntityList);

        // Set loại xe cho cuộc hẹn
        VehicleTypeEntity vehicleType = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(creationAppointmentRequest.getVehicleTypeId());
        if(vehicleType == null) {
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_NOT_FOUND + creationAppointmentRequest.getVehicleTypeId());
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }
        if(!checkVehicleTypeInServiceType(serviceTypeEntityList, vehicleType)){
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE);
        }
        appointmentEntity.setVehicleTypeEntity(vehicleType);

        //Tính giá tạm tính cho những dịch vụ mà khách hàng chọn
        BigDecimal quotePrice = calculateQuotePrice(serviceTypeEntityList);
        appointmentEntity.setQuotePrice(quotePrice);

        // Lấy ra thông tin của cách kỹ thuật viên
        String techniciansSearch = concatTechnicianSearchField(technicians);

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
        }
        appointmentEntity.setCustomer(customer);

        // Thêm thông tin của các kỹ thuật viên vào cuộc hẹn
        //Kiểm tra trong cuộc hẹn đã có kỹ thuật viên đó chưa
        Set<UUID> technicianIdList = new HashSet<>();
        List<UserEntity> technicians = new ArrayList<>();
        updationAppointmentRequest.getTechnicianId().forEach(technicianId -> {
            UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(technicianId);

            //Kiểm tra kỹ thuật viên đó có tồn tại hay không và có bị add trùng không
            if(technician != null && !technicianIdList.contains(technicianId)) {
                checkRoleUser(technician, RoleEnum.TECHNICIAN);
                technicianIdList.add(technicianId);
                technicians.add(technician);
            }
        });
        appointmentEntity.setTechnicianEntities(technicians);

        UserEntity assignee = userRepository.findByUserIdAndIsDeletedFalse(updationAppointmentRequest.getAssigneeId());
        if(assignee != null) {
            checkRoleUser(assignee, RoleEnum.STAFF);
        }
        appointmentEntity.setAssignee(assignee);

        ServiceModeEnum serviceModeEnum = isValidServiceMode(updationAppointmentRequest.getServiceMode());
        appointmentEntity.setServiceMode(serviceModeEnum);

        AppointmentStatusEnum status = isValidAppointmentStatus(updationAppointmentRequest.getStatus());
        appointmentEntity.setStatus(status);

        List<ServiceTypeEntity> serviceTypeEntityList = updationAppointmentRequest.getServiceTypeIds().stream().map(serviceTypeId -> {
            ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(serviceTypeId);
            if(serviceType == null) {
                log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND + serviceTypeId);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
            } else if(serviceType.getParentId() == null){
                log.warn(ServiceTypeConstants.LOG_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE + serviceTypeId);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE);
            }
            return serviceType;
        }).collect(Collectors.toList());
        appointmentEntity.setServiceTypeEntities(serviceTypeEntityList);

        // Set loại xe cho cuộc hẹn
        VehicleTypeEntity vehicleType = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(updationAppointmentRequest.getVehicleTypeId());
        if(vehicleType == null) {
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_NOT_FOUND + updationAppointmentRequest.getVehicleTypeId());
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }
        if(!checkVehicleTypeInServiceType(serviceTypeEntityList, vehicleType)){
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE);
        }
        appointmentEntity.setVehicleTypeEntity(vehicleType);

        //Tính giá tạm tính cho những dịch vụ mà khách hàng chọn
        BigDecimal quotePrice = calculateQuotePrice(serviceTypeEntityList);
        appointmentEntity.setQuotePrice(quotePrice);

        // Lấy ra thông tin của cách kỹ thuật viên
        String techniciansSearch = concatTechnicianSearchField(technicians);

        //Ghép các thông tin lại
        String search = UtilFunction.concatenateSearchField(appointmentEntity.getCustomerFullName(),
                appointmentEntity.getCustomerEmail(),
                appointmentEntity.getCustomerPhoneNumber(),
                customer != null ? customer.getSearch() : "",
                !technicians.isEmpty() ? techniciansSearch : "",
                assignee != null ? assignee.getSearch() : "")
                ;
        appointmentEntity.setSearch(search);

        log.info(AppointmentConstants.LOG_INFO_UPDATING_APPOINTMENT, id);
        appointmentRepository.save(appointmentEntity);
        return true;
    }

    // Lấy giá tạm tính cho cuộc hẹn
    @Override
    public BigDecimal calculateQuotePrice(List<ServiceTypeEntity> serviceTypeEntities) {
        AtomicReference<BigDecimal> quotePrice = new AtomicReference<>(BigDecimal.ZERO);
        log.info(AppointmentConstants.LOG_INFO_CALCULATING_QUOTE_PRICE);
        serviceTypeEntities.forEach(serviceTypeEntity -> serviceTypeEntity.getServiceTypeVehiclePartList().forEach(serviceTypeVehiclePart -> {
                    VehiclePartEntity vehiclePartEntity = serviceTypeVehiclePart.getVehiclePart();
                    if (vehiclePartRepository.existsByVehiclePartIdAndIsDeletedFalse(vehiclePartEntity.getVehiclePartId()) && vehiclePartEntity.getUnitPrice() != null) {
                        quotePrice.set(quotePrice.get().add(vehiclePartEntity.getUnitPrice()));
                    }
                })
        );
        log.info(AppointmentConstants.LOG_SUCCESS_CALCULATING_QUOTE_PRICE);
        return quotePrice.get();
    }

    @Override
    @Transactional
    public boolean updateAppointmentStatus(UUID id, String statusEnum){
        AppointmentStatusEnum status = isValidAppointmentStatus(statusEnum);

        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND + id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }
        appointmentEntity.setStatus(status);

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

    private String concatTechnicianSearchField(List<UserEntity> technicians) {
        if (technicians == null || technicians.isEmpty()) {
            return "";
        }

        return technicians.stream()
                .filter(Objects::nonNull)
                .map(UserEntity::getSearch)
                .filter(Objects::nonNull)
                .collect(Collectors.joining("-"));
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

    private ServiceModeEnum isValidServiceMode(String serviceModeEnum) {
        if (serviceModeEnum == null || serviceModeEnum.isBlank()) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_MODE_ENUM_NOT_MATCH + serviceModeEnum);
            throw new AppointmentValidationException(AppointmentConstants.MESSAGE_ERR_SERVICE_MODE_ENUM_NOT_MATCH);
        }

        try {
            return ServiceModeEnum.valueOf(serviceModeEnum.toUpperCase()); // Chuyển sang chữ hoa để tránh lỗi case-sensitive
        } catch (IllegalArgumentException e) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_MODE_ENUM_NOT_MATCH + serviceModeEnum);
            throw new AppointmentValidationException(AppointmentConstants.MESSAGE_ERR_SERVICE_MODE_ENUM_NOT_MATCH);
        }
    }

    private AppointmentStatusEnum isValidAppointmentStatus(String statusEnum) {
        if (statusEnum == null || statusEnum.isBlank()) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_STATUS_NOT_MATCH + statusEnum);
            throw new AppointmentValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_STATUS_NOT_MATCH);
        }

        try {
            return AppointmentStatusEnum.valueOf(statusEnum.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_STATUS_NOT_MATCH + statusEnum);
            throw new AppointmentValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_STATUS_NOT_MATCH);
        }
    }

    // Kiểm tra loại xe của dịch vụ có tương ứng không
    private boolean checkVehicleTypeInServiceType(List<ServiceTypeEntity> serviceTypeEntities, VehicleTypeEntity vehicleTypeEntity) {
        if (vehicleTypeEntity == null || serviceTypeEntities == null || serviceTypeEntities.isEmpty()) {
            return false;
        }

        // Kiểm tra xem tất cả dịch vụ có cùng loại xe hay không
        return serviceTypeEntities.stream()
                .allMatch(serviceTypeEntity ->
                        serviceTypeEntity != null &&
                                serviceTypeEntity.getVehicleTypeEntity() != null &&
                                serviceTypeEntity.getVehicleTypeEntity().getVehicleTypeId().equals(vehicleTypeEntity.getVehicleTypeId())
                );
    }

    // Show các loại dịch vụ có trong cuộc hẹn
    private List<ServiceTypeResponse> getServiceTypeResponsesForAppointment(AppointmentEntity appointmentEntity) {
        // Nếu danh sách dịch vụ trống hoặc null thì trả về rỗng luôn
        if (appointmentEntity.getServiceTypeEntities() == null || appointmentEntity.getServiceTypeEntities().isEmpty()) {
            return Collections.emptyList();
        }

        return appointmentEntity.getServiceTypeEntities().stream()
                .filter(Objects::nonNull)
                .filter(serviceTypeEntity -> Boolean.FALSE.equals(serviceTypeEntity.getIsDeleted())) // Chỉ lấy dịch vụ chưa bị xóa
                .map(serviceTypeEntity -> {
                    // Lấy thực thể cha (nếu có)
                    ServiceTypeEntity rootEntity = serviceTypeEntity.getParent() != null
                            ? serviceTypeEntity.getParent()
                            : serviceTypeEntity;

                    // Tạo đối tượng phản hồi cho dịch vụ cha
                    ServiceTypeResponse rootResponse = new ServiceTypeResponse();
                    rootResponse.setServiceTypeId(rootEntity.getServiceTypeId());
                    rootResponse.setServiceName(rootEntity.getServiceName());
                    rootResponse.setDescription(rootEntity.getDescription());

                    // Lấy danh sách phụ tùng cho dịch vụ cha
                    List<ServiceTypeVehiclePartResponse> parentParts =
                            serviceTypeVehiclePartService.getVehiclePartResponseByServiceTypeId(rootEntity.getServiceTypeId());
                    rootResponse.setServiceTypeVehiclePartResponses(parentParts.isEmpty() ? null : parentParts);

                    // Lấy thông tin loại xe (nếu có)
                    VehicleTypeEntity vehicleTypeEntity = serviceTypeEntity.getVehicleTypeEntity();
                    if (vehicleTypeEntity != null) {
                        VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
                        vehicleTypeResponse.setVehicleTypeId(vehicleTypeEntity.getVehicleTypeId());
                        vehicleTypeResponse.setVehicleTypeName(vehicleTypeEntity.getVehicleTypeName());
                        rootResponse.setVehicleTypeResponse(vehicleTypeResponse);
                    }

                    // Nếu có parentId → tạo response cho dịch vụ con
                    if (serviceTypeEntity.getParentId() != null) {
                        ServiceTypeResponse childResponse = new ServiceTypeResponse();
                        childResponse.setServiceTypeId(serviceTypeEntity.getServiceTypeId());
                        childResponse.setServiceName(serviceTypeEntity.getServiceName());
                        childResponse.setDescription(serviceTypeEntity.getDescription());
                        childResponse.setParentId(serviceTypeEntity.getParent().getServiceTypeId());

                        // Lấy danh sách phụ tùng cho dịch vụ con
                        List<ServiceTypeVehiclePartResponse> childParts =
                                serviceTypeVehiclePartService.getVehiclePartResponseByServiceTypeId(serviceTypeEntity.getServiceTypeId());
                        childResponse.setServiceTypeVehiclePartResponses(childParts.isEmpty() ? Collections.emptyList() : childParts);

                        // Gắn con vào cha
                        rootResponse.setChildren(List.of(childResponse));
                    }

                    return rootResponse;
                })
                .collect(Collectors.toList());
    }

}
