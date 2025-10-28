package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.*;
import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationCustomerAppointmentRequest;
import com.fpt.evcare.dto.request.maintain_record.CreationMaintenanceRecordRequest;
import com.fpt.evcare.dto.request.maintenance_management.CreationMaintenanceManagementRequest;
import com.fpt.evcare.dto.response.*;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.MaintenanceManagementStatusEnum;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.enums.ServiceModeEnum;
import com.fpt.evcare.enums.ShiftStatusEnum;
import com.fpt.evcare.enums.ShiftTypeEnum;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.AppointmentMapper;
import com.fpt.evcare.mapper.InvoiceMapper;
import com.fpt.evcare.repository.*;
import com.fpt.evcare.service.*;
import com.fpt.evcare.utils.UtilFunction;
import com.fpt.evcare.dto.request.EmailRequestDTO;
import com.fpt.evcare.entity.MaintenanceManagementEntity;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppointmentServiceImpl implements AppointmentService {

    AppointmentRepository appointmentRepository;
    AppointmentMapper appointmentMapper;
    ServiceTypeRepository serviceTypeRepository;
    UserRepository userRepository;
    VehiclePartRepository vehiclePartRepository;
    VehiclePartService vehiclePartService;
    VehicleTypeRepository vehicleTypeRepository;
    MaintenanceManagementService maintenanceManagementService;
    MaintenanceRecordRepository maintenanceRecordRepository;
    MaintenanceManagementRepository maintenanceManagementRepository;
    EmailService emailService;
    InvoiceRepository invoiceRepository;
    InvoiceMapper invoiceMapper;
    PaymentMethodRepository paymentMethodRepository;
    ShiftRepository shiftRepository;
    com.fpt.evcare.service.NotificationHelperService notificationHelperService;

    @Override
    public List<String> getAllServiceMode(){
        log.info(AppointmentConstants.LOG_INFO_SHOWING_SERVICE_MODE_LIST);
        return UtilFunction.getEnumValues(ServiceModeEnum.class);
    }

    @Override
    public String getCancelStatus(){
        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT_CANCELLED_STATUS);
        return AppointmentStatusEnum.CANCELLED.toString();
    }

    @Override
    public String getInProgressStatus(){
        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT_IN_PROGRESS_STATUS);
        return AppointmentStatusEnum.IN_PROGRESS.toString();
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
        if(customer != null){
            UserResponse response = new UserResponse();
            response.setUserId(customer.getUserId());
            appointmentResponse.setCustomer(response);
        }

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
            if(customer != null){
                UserResponse response = new UserResponse();
                response.setUserId(customer.getUserId());
                appointmentResponse.setCustomer(response);
            }

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

    // Hàm dành cho admin
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
            if(customer != null){
                UserResponse response = new UserResponse();
                response.setUserId(customer.getUserId());
                appointmentResponse.setCustomer(response);
            }

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
    public PageResponse<AppointmentResponse> searchAppointmentWithFilters(String keyword, String status, String serviceMode,
                                                                           String fromDate, String toDate, Pageable pageable) {
        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT_LIST);

        Page<AppointmentEntity> appointmentEntityPage = appointmentRepository.findAppointmentsWithFilters(
                keyword, status, serviceMode, fromDate, toDate, pageable);

        List<AppointmentResponse> appointmentResponseList = appointmentEntityPage.map(appointmentEntity -> {
            AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

            UserEntity customer = appointmentEntity.getCustomer();
            if(customer != null){
                UserResponse response = new UserResponse();
                response.setUserId(customer.getUserId());
                appointmentResponse.setCustomer(response);
            }

            List<UserResponse> technicianEntities = new ArrayList<>();
            appointmentEntity.getTechnicianEntities().forEach(technicianEntity -> {
                UserResponse technicianResponse = mapUserEntityToResponse(technicianEntity);
                technicianEntities.add(technicianResponse);
            });
            appointmentResponse.setTechnicianResponses(technicianEntities);

            UserEntity assignee = appointmentEntity.getAssignee();
            appointmentResponse.setAssignee(mapUserEntityToResponse(assignee));

            // Lấy những dịch vụ có trong cuộc hẹn
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

        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT_LIST);
        return PageResponse.<AppointmentResponse>builder()
                .data(appointmentResponseList)
                .page(appointmentEntityPage.getNumber())
                .totalElements(appointmentEntityPage.getTotalElements())
                .totalPages(appointmentEntityPage.getTotalPages())
                .build();
    }

    // Hàm để tra cứu appointment cho khách hàng đã đăng nhập theo email và phone
    @Override
    public PageResponse<AppointmentResponse> getAllAppointmentsByEmailOrPhoneForCustomer(String keyword, Pageable pageable){
        Page<AppointmentEntity> appointmentEntityPage = null;
        if(keyword != null) {
            appointmentEntityPage = appointmentRepository.findAllBySearchContainingIgnoreCaseAndCustomerIsNotNull(keyword, pageable);
        }

        List<AppointmentResponse> appointmentResponseList = appointmentEntityPage.map(appointmentEntity -> {
                    AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

                    UserEntity customer = appointmentEntity.getCustomer();
                    if(customer != null){
                        UserResponse response = new UserResponse();
                        response.setUserId(customer.getUserId());
                        appointmentResponse.setCustomer(response);
                    }

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

    // Hàm để tra cứu appointment cho khách hàng chưa đăng nhập theo email và phone
    @Override
    public PageResponse<AppointmentResponse> getAllAppointmentsByEmailOrPhoneForGuest(String keyword, Pageable pageable){
        Page<AppointmentEntity> appointmentEntityPage = null;
        if(keyword != null) {
            appointmentEntityPage = appointmentRepository.findAllBySearchContainingIgnoreCaseAndCustomerIsNull(keyword, pageable);
        }

        List<AppointmentResponse> appointmentResponseList = appointmentEntityPage.map(appointmentEntity -> {
                    AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

                    UserEntity customer = appointmentEntity.getCustomer();
                    if(customer != null){
                        UserResponse response = new UserResponse();
                        response.setUserId(customer.getUserId());
                        appointmentResponse.setCustomer(response);
                    }

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

        ServiceModeEnum serviceModeEnum = isValidServiceMode(creationAppointmentRequest.getServiceMode());

        // Kiểm tra nếu service mode nếu là MOBILE -> phải nhập user address
        if(serviceModeEnum.equals(ServiceModeEnum.MOBILE)) {
            if(creationAppointmentRequest.getUserAddress() == null){
                log.warn(AppointmentConstants.LOG_ERR_USER_ADDRESS_MUST_BE_ADDED_IF_MOBILE_STATUS_APPEARED);
                throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_USER_ADDRESS_MUST_BE_ADDED_IF_MOBILE_STATUS_APPEARED);
            }
        }

        appointmentEntity.setCreatedBy(creationAppointmentRequest.getCustomerFullName());

        appointmentEntity.setServiceMode(serviceModeEnum);

        appointmentEntity.setStatus(AppointmentStatusEnum.PENDING);

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

        //Kiểm tra ngày lên lịch có phù hợp không
        checkValidScheduleDate(creationAppointmentRequest.getScheduledAt());
        appointmentEntity.setScheduledAt(creationAppointmentRequest.getScheduledAt());

        //Ghép các thông tin lại
        String search = UtilFunction.concatenateSearchField(
                appointmentEntity.getCustomerFullName(),
                appointmentEntity.getCustomerEmail(),
                appointmentEntity.getCustomerPhoneNumber()
        );
        appointmentEntity.setSearch(search);

        log.info(AppointmentConstants.LOG_INFO_CREATING_APPOINTMENT);
        appointmentRepository.save(appointmentEntity);

        autoCreateShiftForAppointment(appointmentEntity);

        return true;
    }


    private void autoCreateShiftForAppointment(AppointmentEntity appointment) {
        log.info(AppointmentConstants.LOG_INFO_AUTO_CREATING_SHIFT, appointment.getAppointmentId());

        try {
            LocalDateTime startTime = appointment.getScheduledAt();

            int totalMinutes = 0;
            if (appointment.getServiceTypeEntities() != null && !appointment.getServiceTypeEntities().isEmpty()) {
                totalMinutes = appointment.getServiceTypeEntities().stream()
                        .filter(service -> !service.getIsDeleted())
                        .mapToInt(service -> service.getEstimatedDurationMinutes() != null
                                ? service.getEstimatedDurationMinutes()
                                : 60)
                        .sum();

                log.info(AppointmentConstants.LOG_INFO_TOTAL_SERVICE_DURATION,
                        totalMinutes, appointment.getServiceTypeEntities().size());
            } else {
                totalMinutes = 120;
                log.warn(AppointmentConstants.LOG_WARN_NO_SERVICES_DEFAULT_DURATION);
            }


            LocalDateTime endTime = startTime.plusMinutes(totalMinutes);
            BigDecimal totalHours = calculateTotalHours(startTime, endTime);

            log.info(AppointmentConstants.LOG_INFO_CALCULATED_SHIFT_TIME,
                    startTime, endTime, totalHours);

            // 3. Build shift entity
            com.fpt.evcare.entity.ShiftEntity shift = com.fpt.evcare.entity.ShiftEntity.builder()
                    .appointment(appointment)
                    .startTime(startTime)
                    .endTime(endTime)
                    .totalHours(totalHours)
                    .status(ShiftStatusEnum.PENDING_ASSIGNMENT) // Chờ phân công người
                    .shiftType(ShiftTypeEnum.APPOINTMENT)
                    .assignee(null) // Chưa có người phụ trách
                    .staff(null) // Chưa có staff
                    .technicians(new ArrayList<>()) // Chưa có technicians
                    .notes("Auto-created from appointment")
                    .build();

            shift.setIsActive(true);
            shift.setIsDeleted(false);

            // Build search field
            String search = com.fpt.evcare.utils.UtilFunction.concatenateSearchField(
                    appointment.getCustomerFullName(),
                    appointment.getAppointmentId().toString(),
                    "PENDING_ASSIGNMENT"
            );
            shift.setSearch(search);

            shiftRepository.save(shift);
            log.info(AppointmentConstants.LOG_SUCCESS_AUTO_CREATED_SHIFT,
                    shift.getShiftId(), appointment.getAppointmentId(), endTime, totalHours);

        } catch (Exception e) {
            log.error(AppointmentConstants.LOG_ERR_AUTO_CREATING_SHIFT,
                    appointment.getAppointmentId(), e.getMessage(), e);
        }
    }

    private BigDecimal calculateTotalHours(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            return BigDecimal.ZERO;
        }

        Duration duration = Duration.between(startTime, endTime);
        double totalHoursDouble = duration.toMinutes() / 60.0;
        return BigDecimal.valueOf(totalHoursDouble).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional
    public boolean updateAppointmentForCustomer(UUID id, UpdationCustomerAppointmentRequest updationCustomerAppointmentRequest) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        // Kiểm tra nếu appointment đang trong IN_PROGRESS, không cho phép cập nhật
        if(appointmentEntity.getStatus().equals(AppointmentStatusEnum.IN_PROGRESS)) {
            log.warn(AppointmentConstants.LOG_ERR_CAN_NOT_UPDATE_CUSTOMER_INFO_IN_IN_PROGRESS_APPOINTMENT_STATUS + id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_CAN_NOT_UPDATE_CUSTOMER_INFO_IN_IN_PROGRESS_APPOINTMENT_STATUS);
        }

        appointmentMapper.toUpdateForCustomer(appointmentEntity, updationCustomerAppointmentRequest);

        if(updationCustomerAppointmentRequest.getServiceTypeIds().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_TYPE_IS_REQUIRED);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_SERVICE_TYPE_IS_REQUIRED);
        }

        //Kiểm tra service mode
        ServiceModeEnum serviceModeEnum = isValidServiceMode(updationCustomerAppointmentRequest.getServiceMode());

        // Kiểm tra nếu service mode nếu là MOBILE -> phải nhập user address
        if(serviceModeEnum.equals(ServiceModeEnum.MOBILE)) {
            if(updationCustomerAppointmentRequest.getUserAddress() == null){
                log.warn(AppointmentConstants.LOG_ERR_USER_ADDRESS_MUST_BE_ADDED_IF_MOBILE_STATUS_APPEARED);
                throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_USER_ADDRESS_MUST_BE_ADDED_IF_MOBILE_STATUS_APPEARED);
            }
        }

        appointmentEntity.setServiceMode(serviceModeEnum);

        // Điều chỉnh lại service type sau cập nhật (nếu có)
        List<ServiceTypeEntity> serviceTypeEntityList = updationCustomerAppointmentRequest.getServiceTypeIds().stream().map(serviceTypeId -> {
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

        // Kiểm tra loại xe (nếu thay đổi)
        VehicleTypeEntity vehicleType = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(updationCustomerAppointmentRequest.getVehicleTypeId());
        if(vehicleType == null) {
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_NOT_FOUND + updationCustomerAppointmentRequest.getVehicleTypeId());
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }
        if(!checkVehicleTypeInServiceType(serviceTypeEntityList, vehicleType)){
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_SERVICE_TYPE_IS_NOT_MATCH_WITH_VEHICLE_TYPE);
        }
        appointmentEntity.setVehicleTypeEntity(vehicleType);

        //Kiểm tra ngày lên lịch có phù hợp không
        checkValidScheduleDate(updationCustomerAppointmentRequest.getScheduledAt());
        appointmentEntity.setScheduledAt(updationCustomerAppointmentRequest.getScheduledAt());

        //Tính giá tạm tính cho những dịch vụ mà khách hàng chọn
        BigDecimal quotePrice = calculateQuotePrice(serviceTypeEntityList);
        appointmentEntity.setQuotePrice(quotePrice);

        //Ghép các thông tin lại
        String search = UtilFunction.concatenateSearchField(appointmentEntity.getCustomerFullName(),
                appointmentEntity.getCustomerEmail(),
                appointmentEntity.getCustomerPhoneNumber()
        );
        appointmentEntity.setSearch(search);

        log.info(AppointmentConstants.LOG_INFO_UPDATING_APPOINTMENT_BY_CUSTOMER + id);
        return true;
    }

    @Override
    @Transactional
    public boolean updateAppointmentForStaff(UUID id, UpdationAppointmentRequest updationAppointmentRequest) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }
        appointmentMapper.toUpdateForAdmin(appointmentEntity, updationAppointmentRequest);

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
            } else {
                log.warn(AppointmentConstants.LOG_ERR_TECHNICIAN_NOT_FOUND + technicianId);
                throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_TECHNICIAN_NOT_FOUND);
            }
        });
        appointmentEntity.setTechnicianEntities(technicians);

        UserEntity assignee = userRepository.findByUserIdAndIsDeletedFalse(updationAppointmentRequest.getAssigneeId());
        if(assignee != null) {
            checkRoleUser(assignee, RoleEnum.STAFF);
            appointmentEntity.setAssignee(assignee);
            appointmentEntity.setUpdatedBy(assignee.getFullName());
        } else {
            log.warn(AppointmentConstants.LOG_ERR_ASSIGNEE_NOT_FOUND + updationAppointmentRequest.getAssigneeId());
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_ASSIGNEE_NOT_FOUND);
        }

        // Lấy ra thông tin của cách kỹ thuật viên
        String techniciansSearch = concatTechnicianSearchField(technicians);

        //Ghép các thông tin lại
        String search = UtilFunction.concatenateSearchField(appointmentEntity.getCustomerFullName(),
                appointmentEntity.getCustomerEmail(),
                appointmentEntity.getCustomerPhoneNumber(),
                !technicians.isEmpty() ? techniciansSearch : "",
                assignee.getSearch() != null ? assignee.getSearch() : ""
        );
        appointmentEntity.setSearch(search);

        log.info(AppointmentConstants.LOG_INFO_UPDATING_APPOINTMENT, id);
        appointmentRepository.save(appointmentEntity);
        return true;
    }

    @Override
    @Transactional
    public void updateAppointmentStatus(UUID id, String status) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if (appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        AppointmentStatusEnum currentStatus = appointmentEntity.getStatus();
        AppointmentStatusEnum newStatus = isValidAppointmentStatus(status);

        // Appointment chỉ hoàn thành khi các Maintenance Management của Appointment đó cùng COMPLETED
        if(newStatus == AppointmentStatusEnum.COMPLETED){
            // Check xem có maintenance nào đang IN_PROGRESS không
            boolean hasInProgressMaintenance = maintenanceManagementRepository.existsByAppointmentIdAndStatus(
                appointmentEntity.getAppointmentId(),
                MaintenanceManagementStatusEnum.IN_PROGRESS.toString()
            );

            if(hasInProgressMaintenance){
                log.warn(AppointmentConstants.LOG_ERR_CANNOT_CHANGE_COMPLETED_STATUS_WHILE_MAINTENANCE_MANAGEMENT_IN_PROGRESS);
                throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_CANNOT_CHANGE_COMPLETED_STATUS_WHILE_MAINTENANCE_MANAGEMENT_IN_PROGRESS);
            }
        }

        // Không cho phép chỉnh sửa nếu đã COMPLETED hoặc CANCELLED
        if (currentStatus == AppointmentStatusEnum.COMPLETED || currentStatus == AppointmentStatusEnum.CANCELLED) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_ALREADY_FINALIZED, currentStatus);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_ALREADY_COMPLETED_OR_CANCELLED);
        }

        // Không cho phép quay ngược từ IN_PROGRESS → PENDING
        if (currentStatus == AppointmentStatusEnum.IN_PROGRESS && newStatus == AppointmentStatusEnum.PENDING) {
            log.warn(AppointmentConstants.LOG_ERR_CAN_NOT_TRANSFER_FROM_IN_PROGRESS_TO_PENDING);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_CAN_NOT_TRANSFER_FROM_IN_PROGRESS_TO_PENDING);
        }

        // Chỉ cho phép chuyển sang IN_PROGRESS khi đang ở PENDING
        if (newStatus == AppointmentStatusEnum.IN_PROGRESS) {
            if (currentStatus != AppointmentStatusEnum.PENDING) {
                log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_INVALID_TRANSITION_TO_IN_PROGRESS);
                throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_INVALID_STATUS_TRANSITION_TO_IN_PROGRESS);
            }

            // Đảm bảo đã có kỹ thuật viên và người được phân công
            if (appointmentEntity.getTechnicianEntities().isEmpty() || appointmentEntity.getAssignee() == null) {
                log.warn(AppointmentConstants.LOG_ERR_THIS_APPOINTMENT_IS_NOT_ASSIGNED);
                throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_THIS_APPOINTMENT_IS_NOT_ASSIGNED);
            }

            // Khi chuyển sang IN_PROGRESS → tạo Maintenance Management
            addMaintenanceManagementData(appointmentEntity);

            // Gửitory notification qua WebSocket
            sendInProgressNotification(appointmentEntity);

            // Gửi email thông báo bắt đầu dịch vụ
            sendInProgressEmail(appointmentEntity);
        }
        
        // Khi chuyển sang COMPLETED → gửi notification
        if (newStatus == AppointmentStatusEnum.COMPLETED) {
            sendCompletedNotification(appointmentEntity);
        }
        
        // Khi chuyển sang CANCELLED → gửi notification
        if (newStatus == AppointmentStatusEnum.CANCELLED) {
            sendCancelledNotification(appointmentEntity);
        }

        // Khi chuyển sang CANCELLED → kiểm tra maintenance
        if (newStatus == AppointmentStatusEnum.CANCELLED) {
            boolean hasMaintenance = maintenanceManagementRepository.existsByAppointmentId(appointmentEntity.getAppointmentId());
            if (hasMaintenance) {
                log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_CANNOT_CANCEL_HAS_MAINTENANCE, id);
                throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_CANNOT_CANCEL_HAS_MAINTENANCE);
            }

            // Xử lý hủy bảo dưỡng (nếu cần)
            cancelAllMaintenanceManagementData(appointmentEntity);
        }

        // Cập nhật trạng thái mới
        appointmentEntity.setStatus(newStatus);
        appointmentRepository.save(appointmentEntity);

        log.info(AppointmentConstants.LOG_INFO_APPOINTMENT_STATUS_UPDATE, id, currentStatus, newStatus);
    }

    // Lấy giá tạm tính cho cuộc hẹn
    @Transactional
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

    private UserResponse mapUserEntityToResponse(UserEntity userEntity){
        UserResponse userResponse = new UserResponse();
        if(userEntity != null) {
            userResponse.setUserId(userEntity.getUserId());
            userResponse.setFullName(userEntity.getFullName());
            userResponse.setNumberPhone(userEntity.getNumberPhone());
            userResponse.setEmail(userEntity.getEmail());

            List<String> roleNames = new ArrayList<>();
            if (userEntity.getRole() != null && userEntity.getRole().getRoleName() != null) {
                roleNames.add(userEntity.getRole().getRoleName().name());
            }
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
        boolean hasRole = userEntity.getRole() != null 
                && roleEnum.name().equalsIgnoreCase(userEntity.getRole().getRoleName().toString());

        if (!hasRole) {
            log.warn(UserConstants.LOG_ERR_USER_ROLE_NOT_PROPER);
            throw new EntityValidationException(UserConstants.MESSAGE_ERR_USER_ROLE_NOT_PROPER);
        }

        log.info(UserConstants.LOG_SUCCESS_VALIDATION_USER_ROLE, roleEnum.name());
    }

    private ServiceModeEnum isValidServiceMode(String serviceModeEnum) {
        if (serviceModeEnum == null || serviceModeEnum.isBlank()) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_MODE_ENUM_NOT_MATCH + serviceModeEnum);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_SERVICE_MODE_ENUM_NOT_MATCH);
        }

        try {
            return ServiceModeEnum.valueOf(serviceModeEnum.toUpperCase()); // Chuyển sang chữ hoa để tránh lỗi case-sensitive
        } catch (IllegalArgumentException e) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICE_MODE_ENUM_NOT_MATCH + serviceModeEnum);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_SERVICE_MODE_ENUM_NOT_MATCH);
        }
    }

    private AppointmentStatusEnum isValidAppointmentStatus(String statusEnum) {
        if (statusEnum == null || statusEnum.isBlank()) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_STATUS_NOT_MATCH + statusEnum);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_STATUS_NOT_MATCH);
        }

        try {
            return AppointmentStatusEnum.valueOf(statusEnum.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_STATUS_NOT_MATCH + statusEnum);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_STATUS_NOT_MATCH);
        }
    }

    private void checkValidScheduleDate(LocalDateTime scheduledAt) {
        if (scheduledAt == null) {
            throw new EntityValidationException(AppointmentConstants.LOG_ERR_SCHEDULE_TIME_NOT_BLANK);
        }

        LocalDateTime now = LocalDateTime.now();

        // Cho phép chọn thời điểm hiện tại hoặc trong tương lai
        // Chỉ block các thời điểm đã qua hơn 1 phút
        LocalDateTime oneMinuteAgo = now.minusMinutes(1);

        if (scheduledAt.isBefore(oneMinuteAgo)) {
            throw new EntityValidationException(AppointmentConstants.LOG_ERR_SCHEDULE_TIME_NOT_LESS_THAN_NOW);
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
        if (appointmentEntity.getServiceTypeEntities() == null || appointmentEntity.getServiceTypeEntities().isEmpty()) {
            return Collections.emptyList();
        }

        Map<UUID, ServiceTypeResponse> parentMap = new LinkedHashMap<>();

        for (ServiceTypeEntity serviceTypeEntity : appointmentEntity.getServiceTypeEntities()) {
            if (serviceTypeEntity == null || Boolean.TRUE.equals(serviceTypeEntity.getIsDeleted())) {
                continue;
            }

            ServiceTypeEntity parent = serviceTypeEntity.getParent() != null
                    ? serviceTypeEntity.getParent()
                    : serviceTypeEntity;

            // Nếu parent chưa tồn tại trong map thì thêm vào
            parentMap.computeIfAbsent(parent.getServiceTypeId(), parentId -> {
                ServiceTypeResponse rootResponse = new ServiceTypeResponse();
                rootResponse.setServiceTypeId(parent.getServiceTypeId());
                rootResponse.setServiceName(parent.getServiceName());
                rootResponse.setDescription(parent.getDescription());

                // Gán loại xe nếu có
                VehicleTypeEntity vehicleTypeEntity = parent.getVehicleTypeEntity();
                if (vehicleTypeEntity != null) {
                    VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
                    vehicleTypeResponse.setVehicleTypeId(vehicleTypeEntity.getVehicleTypeId());
                    vehicleTypeResponse.setVehicleTypeName(vehicleTypeEntity.getVehicleTypeName());
                    rootResponse.setVehicleTypeResponse(vehicleTypeResponse);
                }

                rootResponse.setChildren(new ArrayList<>());
                return rootResponse;
            });

            // Nếu là dịch vụ con → thêm vào danh sách children của cha
            if (serviceTypeEntity.getParentId() != null) {
                ServiceTypeResponse childResponse = new ServiceTypeResponse();
                childResponse.setServiceTypeId(serviceTypeEntity.getServiceTypeId());
                childResponse.setServiceName(serviceTypeEntity.getServiceName());
                childResponse.setDescription(serviceTypeEntity.getDescription());
                childResponse.setParentId(serviceTypeEntity.getParentId());
                parentMap.get(serviceTypeEntity.getParentId()).getChildren().add(childResponse);
            }
        }

        return new ArrayList<>(parentMap.values());
    }

    private void addMaintenanceManagementData(AppointmentEntity appointmentEntity) {

        // Kiểm tra nếu appointment đã có maintenance management thì không tạo lại
        List<MaintenanceManagementEntity> existedManagements = maintenanceManagementRepository.findByAppointmentIdAndIsDeletedFalse(appointmentEntity.getAppointmentId());
        if (!existedManagements.isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_THIS_APPOINTMENT_IS_ALREADY_HAS_MAINTENANCE_MANAGEMENT,
                    appointmentEntity.getAppointmentId());
            return;
        }

        List<ServiceTypeEntity> serviceTypeEntities = appointmentEntity.getServiceTypeEntities();
        if (serviceTypeEntities == null || serviceTypeEntities.isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_SERVICES_ARE_NOT_FOUND_IN_THIS_APPOINTMENT, appointmentEntity.getAppointmentId());
            return;
        }

        // Group theo cha
        Map<ServiceTypeEntity, List<ServiceTypeEntity>> groupedByParent = serviceTypeEntities.stream()
                .collect(Collectors.groupingBy(service ->
                        service.getParent() != null ? service.getParent() : service
                ));

        groupedByParent.forEach((parentService, childServices) -> {
            List<CreationMaintenanceRecordRequest> recordRequests = new ArrayList<>();
            boolean isStockEnough = true;

            for (ServiceTypeEntity child : childServices) {
                List<ServiceTypeVehiclePartEntity> vehiclePartList = child.getServiceTypeVehiclePartList();
                for (ServiceTypeVehiclePartEntity vps : vehiclePartList) {
                    VehiclePartEntity part = vps.getVehiclePart();
                    Integer requiredQuantity = vps.getRequiredQuantity() != null ? vps.getRequiredQuantity() : 0;

                    // Kiểm tra kho còn đủ phụ tùng không
                    if (part.getCurrentQuantity() < requiredQuantity) {
                        log.warn(ServiceTypeConstants.LOG_ERR_PART_NOT_ENOUGH_FOR_USING_IN_SERVICE, part.getVehiclePartName(), child.getServiceName(), requiredQuantity, part.getCurrentQuantity());
                        isStockEnough = false;
                    }

                    // Tạo record
                    CreationMaintenanceRecordRequest recordRequest = new CreationMaintenanceRecordRequest();
                    recordRequest.setVehiclePartInventoryId(part.getVehiclePartId());
                    recordRequest.setApprovedByUser(true);
                    recordRequest.setQuantityUsed(requiredQuantity);
                    recordRequests.add(recordRequest);
                }
            }

            // Nếu không đủ phụ tùng thì không tạo MaintenanceManagement
            if (!isStockEnough) {
                log.warn(MaintenanceManagementConstants.LOG_ERR_CANCEL_INITIALIZING_MAINTENANCE_MANAGEMENT_FOR_THIS_SERVICE_BECAUSE_OF_PART_NOT_ENOUGH, parentService.getServiceName());
                throw new EntityValidationException(MaintenanceManagementConstants.MESSAGE_ERR_CANCEL_INITIALIZING_MAINTENANCE_MANAGEMENT_FOR_THIS_SERVICE_BECAUSE_OF_PART_NOT_ENOUGH);
            }

            // Nếu đủ thì tạo
            CreationMaintenanceManagementRequest managementRequest = new CreationMaintenanceManagementRequest();
            managementRequest.setAppointmentId(appointmentEntity.getAppointmentId());
            managementRequest.setServiceTypeId(parentService.getServiceTypeId());
            managementRequest.setCreationMaintenanceRecordRequests(recordRequests);

            maintenanceManagementService.addMaintenanceManagement(managementRequest);
            log.info(MaintenanceManagementConstants.LOG_SUCCESS_CREATION_MAINTENANCE_MANAGEMENT_BY_APPOINTMENT, parentService.getServiceName(), appointmentEntity.getAppointmentId());
        });
    }

    private void cancelAllMaintenanceManagementData(AppointmentEntity appointmentEntity) {
        List<MaintenanceManagementEntity> existedMaintenanceManagements = appointmentRepository.findAllInProgressMaintenanceManagementsByAppointmentId(appointmentEntity.getAppointmentId());

        //Nếu maintenance management đang tiến hành thì không được phép hủy cuộc hẹn
        if(!existedMaintenanceManagements.isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_CANNOT_CANCEL_APPOINTMENT_HAS_IN_PROGRESS_MAINTENANCE_MANAGEMENT + appointmentEntity.getAppointmentId());
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_CANNOT_CANCEL_APPOINTMENT_HAS_IN_PROGRESS_MAINTENANCE_MANAGEMENT);
        } else {
            // Set trạng thái là CANCELLED cho tất cả maintenance management liên quan đến cuộc hẹn
            List<MaintenanceManagementEntity> maintenanceManagementEntities1 = appointmentEntity.getMaintenanceManagementEntities();
            maintenanceManagementEntities1.forEach(maintenanceManagementEntity -> {
                List<MaintenanceRecordEntity> maintenanceRecordEntities = maintenanceManagementEntity.getMaintenanceRecords();
                for (MaintenanceRecordEntity maintenanceRecordEntity : maintenanceRecordEntities) {
                    VehiclePartEntity vehiclePart = maintenanceRecordEntity.getVehiclePart();
                    Integer quantityUsed = maintenanceRecordEntity.getQuantityUsed();

                    // Nếu maintenance record có số lượng cụ thể -> hoàn lại vào kho
                    if (vehiclePart != null && quantityUsed != null && quantityUsed > 0) {
                        vehiclePartService.restoreQuantity(vehiclePart.getVehiclePartId(), quantityUsed);
                        maintenanceRecordEntity.setQuantityUsed(0);
                    }
                }
                // Lưu lại toàn bộ record đã cập nhật
                maintenanceRecordRepository.saveAll(maintenanceRecordEntities);

                maintenanceManagementEntity.setStatus(MaintenanceManagementStatusEnum.CANCELLED);
            });

            // Lưu lại trạng thái của maintenance management
            maintenanceManagementRepository.saveAll(maintenanceManagementEntities1);
        }
    }

    /**
     * Gửi email thông báo bắt đầu dịch vụ khi appointment chuyển sang IN_PROGRESS
     */
    private void sendInProgressEmail(AppointmentEntity appointment) {
        if (appointment.getCustomerEmail() == null || appointment.getCustomerEmail().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
            return;
        }

        try {
            String emailSubject = AppointmentConstants.EMAIL_SUBJECT_IN_PROGRESS;
            String emailBody = String.format(
                AppointmentConstants.EMAIL_BODY_IN_PROGRESS_GREETING +
                AppointmentConstants.EMAIL_BODY_IN_PROGRESS_CONTENT +
                AppointmentConstants.EMAIL_BODY_IN_PROGRESS_APPOINTMENT_INFO +
                AppointmentConstants.EMAIL_BODY_IN_PROGRESS_APPOINTMENT_ID +
                AppointmentConstants.EMAIL_BODY_IN_PROGRESS_VEHICLE +
                AppointmentConstants.EMAIL_BODY_IN_PROGRESS_TIME +
                AppointmentConstants.EMAIL_BODY_IN_PROGRESS_FOOTER,
                appointment.getCustomerFullName(),
                appointment.getAppointmentId(),
                appointment.getVehicleNumberPlate(),
                appointment.getScheduledAt().toString()
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(appointment.getCustomerEmail())
                    .subject(emailSubject)
                    .text(emailBody)
                    .fullName(appointment.getCustomerFullName())
                    .code(null)
                    .build();

            emailService.sendEmailTemplate(emailRequest);
            log.info(AppointmentConstants.LOG_INFO_SENT_IN_PROGRESS_EMAIL, appointment.getCustomerEmail());
        } catch (Exception e) {
            log.error(AppointmentConstants.LOG_ERR_FAILED_SEND_IN_PROGRESS_EMAIL, e.getMessage());
        }
    }
    
    /**
     * Gửi notification qua WebSocket khi appointment chuyển sang IN_PROGRESS
     */
    private void sendInProgressNotification(AppointmentEntity appointment) {
        try {
            com.fpt.evcare.service.NotificationHelperService.NotificationData notif = 
                new com.fpt.evcare.service.NotificationHelperService.NotificationData();
            notif.setTitle("Dịch vụ đã bắt đầu");
            notif.setContent(String.format("Dịch vụ cho xe %s đã được bắt đầu xử lý", 
                appointment.getVehicleNumberPlate()));
            notif.setNotificationType("ALERT");
            notif.setAppointmentId(appointment.getAppointmentId().toString());
            
            notificationHelperService.sendNotification(appointment.getCustomer().getUserId(), notif);
            log.info("📬 Sent IN_PROGRESS notification to customer: {}", appointment.getCustomer().getUserId());
        } catch (Exception e) {
            log.error("❌ Failed to send IN_PROGRESS notification: {}", e.getMessage());
        }
    }
    
    /**
     * Gửi notification qua WebSocket khi appointment chuyển sang COMPLETED
     */
    private void sendCompletedNotification(AppointmentEntity appointment) {
        try {
            com.fpt.evcare.service.NotificationHelperService.NotificationData notif = 
                new com.fpt.evcare.service.NotificationHelperService.NotificationData();
            notif.setTitle("Dịch vụ đã hoàn thành");
            notif.setContent(String.format("Dịch vụ cho xe %s đã hoàn thành. Vui lòng thanh toán hóa đơn!", 
                appointment.getVehicleNumberPlate()));
            notif.setNotificationType("REMINDER");
            notif.setAppointmentId(appointment.getAppointmentId().toString());
            
            notificationHelperService.sendNotification(appointment.getCustomer().getUserId(), notif);
            log.info("📬 Sent COMPLETED notification to customer: {}", appointment.getCustomer().getUserId());
        } catch (Exception e) {
            log.error("❌ Failed to send COMPLETED notification: {}", e.getMessage());
        }
    }
    
    /**
     * Gửi notification qua WebSocket khi appointment chuyển sang CANCELLED
     */
    private void sendCancelledNotification(AppointmentEntity appointment) {
        try {
            com.fpt.evcare.service.NotificationHelperService.NotificationData notif = 
                new com.fpt.evcare.service.NotificationHelperService.NotificationData();
            notif.setTitle("Đã hủy dịch vụ");
            notif.setContent(String.format("Dịch vụ cho xe %s đã bị hủy", 
                appointment.getVehicleNumberPlate()));
            notif.setNotificationType("ALERT");
            notif.setAppointmentId(appointment.getAppointmentId().toString());
            
            notificationHelperService.sendNotification(appointment.getCustomer().getUserId(), notif);
            log.info("📬 Sent CANCELLED notification to customer: {}", appointment.getCustomer().getUserId());
        } catch (Exception e) {
            log.error("❌ Failed to send CANCELLED notification: {}", e.getMessage());
        }
    }
}
