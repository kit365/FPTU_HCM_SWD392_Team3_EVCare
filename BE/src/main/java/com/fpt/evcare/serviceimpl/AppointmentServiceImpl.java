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
import com.fpt.evcare.service.RedisService;
import com.fpt.evcare.utils.UtilFunction;
import com.fpt.evcare.dto.request.EmailRequestDTO;
import com.fpt.evcare.entity.MaintenanceManagementEntity;
import com.fpt.evcare.entity.MaintenanceRecordEntity;
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
    RedisService<String> redisService;
    
    private static final String GUEST_OTP_REDIS_KEY_PREFIX = "guest_appointment_otp:";
    private static final int OTP_LENGTH = 6;
    private static final long OTP_TTL_MINUTES = 5;
    private final java.security.SecureRandom random = new java.security.SecureRandom();

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
        return getAppointmentById(id, null);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID id, UUID currentUserId) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        // Force initialization of lazy-loaded relationships within transaction
        initializeAppointmentRelations(appointmentEntity);

        // Nếu user là customer (có currentUserId), kiểm tra xem appointment có phải của họ không
        if(currentUserId != null && appointmentEntity.getCustomer() != null) {
            if (!appointmentEntity.getCustomer().getUserId().equals(currentUserId)) {
                log.warn("Customer {} attempted to access appointment {} that doesn't belong to them", currentUserId, id);
                throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
            }
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
    public AppointmentEntity getAppointmentEntityById(UUID id) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if(appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }


        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT + id);
        return appointmentEntity;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponse> getAppointmentsByUserId(UUID userId, String keyword, Pageable pageable){
        UserEntity userEntity =  userRepository.findByUserIdAndIsDeletedFalse(userId);
        if(userEntity == null) {
            log.warn(UserConstants.LOG_ERR_USER_NOT_FOUND + userId);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        Page<AppointmentEntity> appointmentEntityPage = appointmentRepository.findAppointmentsByCustomerAndKeyword(userId, keyword, pageable);

        // Nếu không có kết quả, trả về page rỗng thay vì throw exception
        if(appointmentEntityPage == null || appointmentEntityPage.getTotalElements() == 0) {
            log.info("No appointments found for user {} - returning empty page", userId);
            return PageResponse.<AppointmentResponse>builder()
                    .data(List.of())
                    .page(pageable != null ? pageable.getPageNumber() : 0)
                    .size(pageable != null ? pageable.getPageSize() : 10)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        // Force initialization of lazy-loaded relationships within transaction
        appointmentEntityPage.getContent().forEach(this::initializeAppointmentRelations);

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
                vehicleTypeResponse.setBatteryCapacity(appointmentEntity.getVehicleTypeEntity().getBatteryCapacity());
                vehicleTypeResponse.setMaintenanceIntervalKm(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalKm());
                vehicleTypeResponse.setMaintenanceIntervalMonths(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalMonths());
                vehicleTypeResponse.setManufacturer(appointmentEntity.getVehicleTypeEntity().getManufacturer());
                vehicleTypeResponse.setModelYear(appointmentEntity.getVehicleTypeEntity().getModelYear());
                vehicleTypeResponse.setDescription(appointmentEntity.getVehicleTypeEntity().getDescription());
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
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponse> searchAppointment(String keyword, Pageable pageable) {
        Page<AppointmentEntity> appointmentEntityPage;

        if(keyword == null || keyword.isEmpty()) {
            appointmentEntityPage = appointmentRepository.findByIsDeletedFalse(pageable);
        } else {
            appointmentEntityPage = appointmentRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }

        // Nếu không có kết quả, trả về page rỗng thay vì throw exception
        if(appointmentEntityPage == null || appointmentEntityPage.getTotalElements() == 0) {
            log.info("No appointments found - returning empty page");
            return PageResponse.<AppointmentResponse>builder()
                    .data(List.of())
                    .page(pageable != null ? pageable.getPageNumber() : 0)
                    .size(pageable != null ? pageable.getPageSize() : 10)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        // Force initialization of lazy-loaded relationships within transaction
        appointmentEntityPage.getContent().forEach(this::initializeAppointmentRelations);

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
                vehicleTypeResponse.setBatteryCapacity(appointmentEntity.getVehicleTypeEntity().getBatteryCapacity());
                vehicleTypeResponse.setMaintenanceIntervalKm(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalKm());
                vehicleTypeResponse.setMaintenanceIntervalMonths(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalMonths());
                vehicleTypeResponse.setManufacturer(appointmentEntity.getVehicleTypeEntity().getManufacturer());
                vehicleTypeResponse.setModelYear(appointmentEntity.getVehicleTypeEntity().getModelYear());
                vehicleTypeResponse.setDescription(appointmentEntity.getVehicleTypeEntity().getDescription());
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
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponse> searchAppointmentWithFilters(String keyword, String status, String serviceMode,
                                                                           String fromDate, String toDate, Pageable pageable) {
        log.info(AppointmentConstants.LOG_INFO_SHOWING_APPOINTMENT_LIST);

        Page<AppointmentEntity> appointmentEntityPage = appointmentRepository.findAppointmentsWithFilters(
                keyword, status, serviceMode, fromDate, toDate, pageable);

        // Force initialization of lazy-loaded relationships within transaction
        appointmentEntityPage.getContent().forEach(this::initializeAppointmentRelations);

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
                vehicleTypeResponse.setBatteryCapacity(appointmentEntity.getVehicleTypeEntity().getBatteryCapacity());
                vehicleTypeResponse.setMaintenanceIntervalKm(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalKm());
                vehicleTypeResponse.setMaintenanceIntervalMonths(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalMonths());
                vehicleTypeResponse.setManufacturer(appointmentEntity.getVehicleTypeEntity().getManufacturer());
                vehicleTypeResponse.setModelYear(appointmentEntity.getVehicleTypeEntity().getModelYear());
                vehicleTypeResponse.setDescription(appointmentEntity.getVehicleTypeEntity().getDescription());
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
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponse> getAllAppointmentsByEmailOrPhoneForCustomer(String keyword, UUID currentUserId, Pageable pageable){
        Page<AppointmentEntity> appointmentEntityPage;
        
        // Nếu có currentUserId (user đã authenticated), lấy appointments của user đó
        if(currentUserId != null) {
            log.info("🔍 Fetching appointments for authenticated user with customerId: {}", currentUserId);
            appointmentEntityPage = appointmentRepository.findByCustomerId(currentUserId, pageable);
        } else if(keyword == null || keyword.trim().isEmpty()) {
            // Nếu không có keyword và không có userId, trả về empty result
            log.info("No keyword or userId provided, returning empty result");
            appointmentEntityPage = Page.empty(pageable);
        } else {
            // Tìm theo email, phone hoặc search field (cho trường hợp search như guest)
            log.info("🔍 Searching appointments by keyword: {}", keyword);
            appointmentEntityPage = appointmentRepository.findByEmailOrPhoneForCustomer(keyword.trim(), pageable);
        }

        if(appointmentEntityPage == null || appointmentEntityPage.isEmpty()) {
            log.info("No appointments found for customer - userId: {}, keyword: {}", currentUserId, keyword);
            return PageResponse.<AppointmentResponse>builder()
                    .data(new ArrayList<>())
                    .page(pageable.getPageNumber())
                    .size(pageable.getPageSize())
                    .totalElements(0L)
                    .totalPages(0)
                    .build();
        }

        // Force initialization of lazy-loaded relationships within transaction
        appointmentEntityPage.getContent().forEach(this::initializeAppointmentRelations);

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
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponse> getAllAppointmentsByEmailOrPhoneForGuest(String keyword, Pageable pageable){
        Page<AppointmentEntity> appointmentEntityPage;
        
        if(keyword == null || keyword.trim().isEmpty()) {
            // Nếu không có keyword, trả về empty result
            appointmentEntityPage = Page.empty(pageable);
        } else {
            // Tìm theo email, phone hoặc search field cho khách vãng lai
            appointmentEntityPage = appointmentRepository.findByEmailOrPhoneForGuest(keyword.trim(), pageable);
        }

        if(appointmentEntityPage == null || appointmentEntityPage.isEmpty()) {
            log.info("No appointments found for guest with keyword: {}", keyword);
            return PageResponse.<AppointmentResponse>builder()
                    .data(new ArrayList<>())
                    .page(pageable.getPageNumber())
                    .size(pageable.getPageSize())
                    .totalElements(0L)
                    .totalPages(0)
                    .build();
        }

        // Force initialization of lazy-loaded relationships within transaction
        appointmentEntityPage.getContent().forEach(this::initializeAppointmentRelations);

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

        log.info("🔍 Creating appointment with customerId: {}", creationAppointmentRequest.getCustomerId());
        UserEntity customer = userRepository.findByUserIdAndIsDeletedFalse(creationAppointmentRequest.getCustomerId());
        log.info("👤 Found customer: {}", customer != null ? customer.getEmail() : "NULL");
        if(customer != null) {
            checkRoleUser(customer, RoleEnum.CUSTOMER);
            appointmentEntity.setCustomer(customer);
            // Đảm bảo customerEmail được set từ customer entity nếu chưa có
            if (appointmentEntity.getCustomerEmail() == null || appointmentEntity.getCustomerEmail().isEmpty()) {
                appointmentEntity.setCustomerEmail(customer.getEmail());
            }
            // Đảm bảo customerFullName được set từ customer entity nếu chưa có
            if (appointmentEntity.getCustomerFullName() == null || appointmentEntity.getCustomerFullName().isEmpty()) {
                appointmentEntity.setCustomerFullName(customer.getFullName());
            }
            // Đảm bảo customerPhoneNumber được set từ customer entity nếu chưa có
            if (appointmentEntity.getCustomerPhoneNumber() == null || appointmentEntity.getCustomerPhoneNumber().isEmpty()) {
                appointmentEntity.setCustomerPhoneNumber(customer.getNumberPhone());
            }
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
        AppointmentEntity savedEntity = appointmentRepository.save(appointmentEntity);
        log.info("✅ Saved appointment with ID: {} and customer_id: {}", 
                savedEntity.getAppointmentId(), 
                savedEntity.getCustomer() != null ? savedEntity.getCustomer().getUserId() : "NULL");

        autoCreateShiftForAppointment(appointmentEntity);

        // Gửi email thông báo tạo appointment thành công (trạng thái PENDING)
        sendPendingEmail(appointmentEntity);

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

        // Tự động chuyển PENDING → CONFIRMED sau khi phân công thành công
        if (appointmentEntity.getStatus() == AppointmentStatusEnum.PENDING && 
            !technicians.isEmpty() && assignee != null) {
            appointmentEntity.setStatus(AppointmentStatusEnum.CONFIRMED);
            log.info("Appointment {} automatically changed to CONFIRMED after assignment", id);
        }

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

        // Cập nhật trạng thái mới trước
        appointmentEntity.setStatus(newStatus);
        appointmentRepository.save(appointmentEntity);
        appointmentRepository.flush();
        
        // Reload entity để đảm bảo có đầy đủ thông tin (bao gồm cả customerEmail từ customer entity)
        AppointmentEntity refreshedAppointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if (refreshedAppointment == null) {
            log.warn("Failed to reload appointment after status update: {}", id);
            refreshedAppointment = appointmentEntity; // Fallback to original entity
        } else {
            // Đảm bảo customerEmail được set từ customer nếu có
            if ((refreshedAppointment.getCustomerEmail() == null || refreshedAppointment.getCustomerEmail().isEmpty()) 
                && refreshedAppointment.getCustomer() != null && refreshedAppointment.getCustomer().getEmail() != null) {
                refreshedAppointment.setCustomerEmail(refreshedAppointment.getCustomer().getEmail());
            }
            // Đảm bảo customerFullName được set từ customer nếu có
            if ((refreshedAppointment.getCustomerFullName() == null || refreshedAppointment.getCustomerFullName().isEmpty()) 
                && refreshedAppointment.getCustomer() != null && refreshedAppointment.getCustomer().getFullName() != null) {
                refreshedAppointment.setCustomerFullName(refreshedAppointment.getCustomer().getFullName());
            }
        }

        // Chỉ cho phép chuyển sang CONFIRMED khi đang ở PENDING
        if (newStatus == AppointmentStatusEnum.CONFIRMED) {
            if (currentStatus != AppointmentStatusEnum.PENDING) {
                log.warn("Cannot transition to CONFIRMED from status: {}", currentStatus);
                throw new EntityValidationException("Chỉ có thể chuyển sang CONFIRMED từ trạng thái PENDING");
            }

            // Đảm bảo đã có kỹ thuật viên và người được phân công
            if (appointmentEntity.getTechnicianEntities().isEmpty() || appointmentEntity.getAssignee() == null) {
                log.warn(AppointmentConstants.LOG_ERR_THIS_APPOINTMENT_IS_NOT_ASSIGNED);
                throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_THIS_APPOINTMENT_IS_NOT_ASSIGNED);
            }
            
            // Gửi email thông báo xác nhận cuộc hẹn (SAU khi cập nhật status)
            sendConfirmedEmail(refreshedAppointment);
        }

        // Chỉ cho phép chuyển sang IN_PROGRESS khi đang ở CONFIRMED
        if (newStatus == AppointmentStatusEnum.IN_PROGRESS) {
            if (currentStatus != AppointmentStatusEnum.CONFIRMED) {
                log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_INVALID_TRANSITION_TO_IN_PROGRESS);
                throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_INVALID_STATUS_TRANSITION_TO_IN_PROGRESS);
            }

            // Khi chuyển sang IN_PROGRESS → tạo Maintenance Management
            addMaintenanceManagementData(appointmentEntity);

            // ✅ Tự động cập nhật shift status sang IN_PROGRESS khi appointment chuyển sang IN_PROGRESS
            // Để kỹ thuật viên có thể thấy ca làm mới trong danh sách "Ca làm của tôi"
            updateShiftStatusWhenAppointmentInProgress(appointmentEntity.getAppointmentId());

            // Gửitory notification qua WebSocket
            sendInProgressNotification(refreshedAppointment);

            // Gửi email thông báo bắt đầu dịch vụ (SAU khi cập nhật status)
            sendInProgressEmail(refreshedAppointment);
        }
        
        // Khi chuyển sang COMPLETED → gửi notification và email (SAU khi cập nhật status)
        if (newStatus == AppointmentStatusEnum.COMPLETED) {
            sendCompletedNotification(refreshedAppointment);
            sendCompletedEmail(refreshedAppointment);
        }
        
        // Khi chuyển sang CANCELLED → gửi notification và email (SAU khi cập nhật status)
        if (newStatus == AppointmentStatusEnum.CANCELLED) {
            sendCancelledNotification(refreshedAppointment);
            sendCancelledEmail(refreshedAppointment);
        }
        
        // Khi chuyển sang PENDING_PAYMENT → gửi email thông báo hóa đơn (SAU khi cập nhật status)
        if (newStatus == AppointmentStatusEnum.PENDING_PAYMENT) {
            sendPendingPaymentEmail(refreshedAppointment);
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
                rootResponse.setEstimatedDurationMinutes(parent.getEstimatedDurationMinutes());
                rootResponse.setIsActive(parent.getIsActive());

                // Gán loại xe nếu có
                VehicleTypeEntity vehicleTypeEntity = parent.getVehicleTypeEntity();
                if (vehicleTypeEntity != null) {
                    VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
                    vehicleTypeResponse.setVehicleTypeId(vehicleTypeEntity.getVehicleTypeId());
                    vehicleTypeResponse.setVehicleTypeName(vehicleTypeEntity.getVehicleTypeName());
                    rootResponse.setVehicleTypeResponse(vehicleTypeResponse);
                }

                // Khởi tạo children list ngay từ đầu
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
                childResponse.setEstimatedDurationMinutes(serviceTypeEntity.getEstimatedDurationMinutes());
                childResponse.setIsActive(serviceTypeEntity.getIsActive());
                
                // Đảm bảo parent tồn tại trước khi thêm child
                ServiceTypeResponse parentResponse = parentMap.get(serviceTypeEntity.getParentId());
                if (parentResponse != null && parentResponse.getChildren() != null) {
                    parentResponse.getChildren().add(childResponse);
                }
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

            // ⚠️ CHECK: Nếu dịch vụ chưa được config phụ tùng thì SKIP (tránh lỗi "danh sách rỗng")
            if (recordRequests.isEmpty()) {
                log.warn("⚠️ Service '{}' chưa được cấu hình phụ tùng trong service_type_vehicle_part. Skip tạo MaintenanceManagement cho dịch vụ này!", parentService.getServiceName());
                return; // Skip service này, không throw exception
            }

            // Nếu đủ phụ tùng và có record thì tạo
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
     * Gửi email thông báo tạo appointment thành công (trạng thái PENDING)
     */
    private void sendPendingEmail(AppointmentEntity appointment) {
        if (appointment.getCustomerEmail() == null || appointment.getCustomerEmail().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
            return;
        }

        try {
            String emailSubject = AppointmentConstants.EMAIL_SUBJECT_PENDING;
            String emailBody = String.format(
                AppointmentConstants.EMAIL_BODY_PENDING_GREETING +
                AppointmentConstants.EMAIL_BODY_PENDING_CONTENT +
                AppointmentConstants.EMAIL_BODY_PENDING_APPOINTMENT_INFO +
                AppointmentConstants.EMAIL_BODY_PENDING_APPOINTMENT_ID +
                AppointmentConstants.EMAIL_BODY_PENDING_VEHICLE +
                AppointmentConstants.EMAIL_BODY_PENDING_TIME +
                AppointmentConstants.EMAIL_BODY_PENDING_FOOTER,
                appointment.getCustomerFullName(),
                appointment.getAppointmentId(),
                appointment.getVehicleNumberPlate(),
                appointment.getScheduledAt() != null ? appointment.getScheduledAt().toString() : "N/A"
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(appointment.getCustomerEmail())
                    .subject(emailSubject)
                    .text(emailBody)
                    .fullName(appointment.getCustomerFullName())
                    .code(null)
                    .build();

            emailService.sendEmailTemplate(emailRequest);
            log.info(AppointmentConstants.LOG_INFO_SENT_PENDING_EMAIL, appointment.getCustomerEmail());
        } catch (Exception e) {
            log.error(AppointmentConstants.LOG_ERR_FAILED_SEND_PENDING_EMAIL, e.getMessage());
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

    /**
     * Gửi email thông báo xác nhận cuộc hẹn khi appointment chuyển sang CONFIRMED
     */
    private void sendConfirmedEmail(AppointmentEntity appointment) {
        if (appointment.getCustomerEmail() == null || appointment.getCustomerEmail().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
            return;
        }

        try {
            String emailSubject = AppointmentConstants.EMAIL_SUBJECT_CONFIRMED;
            String assigneeName = appointment.getAssignee() != null ? appointment.getAssignee().getFullName() : "N/A";
            
            String emailBody = String.format(
                AppointmentConstants.EMAIL_BODY_CONFIRMED_GREETING +
                AppointmentConstants.EMAIL_BODY_CONFIRMED_CONTENT +
                AppointmentConstants.EMAIL_BODY_CONFIRMED_APPOINTMENT_INFO +
                AppointmentConstants.EMAIL_BODY_CONFIRMED_APPOINTMENT_ID +
                AppointmentConstants.EMAIL_BODY_CONFIRMED_VEHICLE +
                AppointmentConstants.EMAIL_BODY_CONFIRMED_TIME +
                AppointmentConstants.EMAIL_BODY_CONFIRMED_ASSIGNEE +
                AppointmentConstants.EMAIL_BODY_CONFIRMED_FOOTER,
                appointment.getCustomerFullName(),
                appointment.getAppointmentId(),
                appointment.getVehicleNumberPlate(),
                appointment.getScheduledAt() != null ? appointment.getScheduledAt().toString() : "N/A",
                assigneeName
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(appointment.getCustomerEmail())
                    .subject(emailSubject)
                    .text(emailBody)
                    .fullName(appointment.getCustomerFullName())
                    .code(null)
                    .build();

            emailService.sendEmailTemplate(emailRequest);
            log.info(AppointmentConstants.LOG_INFO_SENT_CONFIRMED_EMAIL, appointment.getCustomerEmail());
        } catch (Exception e) {
            log.error(AppointmentConstants.LOG_ERR_FAILED_SEND_CONFIRMED_EMAIL, e.getMessage());
        }
    }

    /**
     * Gửi email thông báo hoàn thành cuộc hẹn khi appointment chuyển sang COMPLETED
     */
    private void sendCompletedEmail(AppointmentEntity appointment) {
        if (appointment.getCustomerEmail() == null || appointment.getCustomerEmail().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
            return;
        }

        try {
            String emailSubject = AppointmentConstants.EMAIL_SUBJECT_COMPLETED;
            String emailBody = String.format(
                AppointmentConstants.EMAIL_BODY_COMPLETED_GREETING +
                AppointmentConstants.EMAIL_BODY_COMPLETED_CONTENT +
                AppointmentConstants.EMAIL_BODY_COMPLETED_APPOINTMENT_INFO +
                AppointmentConstants.EMAIL_BODY_COMPLETED_APPOINTMENT_ID +
                AppointmentConstants.EMAIL_BODY_COMPLETED_VEHICLE +
                AppointmentConstants.EMAIL_BODY_COMPLETED_FOOTER,
                appointment.getCustomerFullName(),
                appointment.getAppointmentId(),
                appointment.getVehicleNumberPlate()
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(appointment.getCustomerEmail())
                    .subject(emailSubject)
                    .text(emailBody)
                    .fullName(appointment.getCustomerFullName())
                    .code(null)
                    .build();

            emailService.sendEmailTemplate(emailRequest);
            log.info(AppointmentConstants.LOG_INFO_SENT_COMPLETED_EMAIL, appointment.getCustomerEmail());
        } catch (Exception e) {
            log.error(AppointmentConstants.LOG_ERR_FAILED_SEND_COMPLETED_EMAIL, e.getMessage());
        }
    }

    /**
     * Gửi email thông báo hủy cuộc hẹn khi appointment chuyển sang CANCELLED
     */
    private void sendCancelledEmail(AppointmentEntity appointment) {
        if (appointment.getCustomerEmail() == null || appointment.getCustomerEmail().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
            return;
        }

        try {
            String emailSubject = AppointmentConstants.EMAIL_SUBJECT_CANCELLED;
            String emailBody = String.format(
                AppointmentConstants.EMAIL_BODY_CANCELLED_GREETING +
                AppointmentConstants.EMAIL_BODY_CANCELLED_CONTENT +
                AppointmentConstants.EMAIL_BODY_CANCELLED_APPOINTMENT_INFO +
                AppointmentConstants.EMAIL_BODY_CANCELLED_APPOINTMENT_ID +
                AppointmentConstants.EMAIL_BODY_CANCELLED_VEHICLE +
                AppointmentConstants.EMAIL_BODY_CANCELLED_TIME +
                AppointmentConstants.EMAIL_BODY_CANCELLED_FOOTER,
                appointment.getCustomerFullName(),
                appointment.getAppointmentId(),
                appointment.getVehicleNumberPlate(),
                appointment.getScheduledAt() != null ? appointment.getScheduledAt().toString() : "N/A"
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(appointment.getCustomerEmail())
                    .subject(emailSubject)
                    .text(emailBody)
                    .fullName(appointment.getCustomerFullName())
                    .code(null)
                    .build();

            emailService.sendEmailTemplate(emailRequest);
            log.info(AppointmentConstants.LOG_INFO_SENT_CANCELLED_EMAIL, appointment.getCustomerEmail());
        } catch (Exception e) {
            log.error(AppointmentConstants.LOG_ERR_FAILED_SEND_CANCELLED_EMAIL, e.getMessage());
        }
    }

    /**
     * Gửi email thông báo chờ thanh toán với thông tin hóa đơn chi tiết
     */
    private void sendPendingPaymentEmail(AppointmentEntity appointment) {
        if (appointment.getCustomerEmail() == null || appointment.getCustomerEmail().isEmpty()) {
            log.warn(AppointmentConstants.LOG_ERR_CUSTOMER_EMAIL_NULL_OR_EMPTY);
            return;
        }

        try {
            // Lấy invoice của appointment
            List<InvoiceEntity> invoices = invoiceRepository.findByAppointmentAndIsDeletedFalse(appointment);
            if (invoices.isEmpty()) {
                log.warn("No invoice found for appointment: {}", appointment.getAppointmentId());
                return;
            }

            InvoiceEntity invoice = invoices.get(0);
            
            // Lấy thông tin maintenance management để tạo chi tiết hóa đơn
            List<MaintenanceManagementEntity> maintenanceList = 
                maintenanceManagementRepository.findByAppointmentIdAndIsDeletedFalse(appointment.getAppointmentId());
            
            // Format thông tin hóa đơn chi tiết
            StringBuilder invoiceDetails = new StringBuilder();
            invoiceDetails.append(String.format("- Mã hóa đơn: %s\n", invoice.getInvoiceId()));
            invoiceDetails.append(String.format("- Tổng tiền: %s VNĐ\n", invoice.getTotalAmount()));
            invoiceDetails.append(String.format("- Ngày tạo: %s\n", invoice.getInvoiceDate()));
            if (invoice.getDueDate() != null) {
                invoiceDetails.append(String.format("- Hạn thanh toán: %s\n", invoice.getDueDate()));
            }
            
            // Thêm chi tiết dịch vụ và phụ tùng
            if (!maintenanceList.isEmpty()) {
                invoiceDetails.append("\nChi tiết dịch vụ và phụ tùng:\n");
                for (MaintenanceManagementEntity mm : maintenanceList) {
                    String serviceName = mm.getServiceType() != null ? mm.getServiceType().getServiceName() : "N/A";
                    BigDecimal serviceCost = mm.getTotalCost() != null ? mm.getTotalCost() : BigDecimal.ZERO;
                    invoiceDetails.append(String.format("\n• %s - %s VNĐ\n", serviceName, serviceCost));
                    
                    if (mm.getMaintenanceRecords() != null && !mm.getMaintenanceRecords().isEmpty()) {
                        for (MaintenanceRecordEntity record : mm.getMaintenanceRecords()) {
                            if (record.getIsDeleted() || !Boolean.TRUE.equals(record.getApprovedByUser())) {
                                continue;
                            }
                            
                            String partName = record.getVehiclePart() != null ? 
                                record.getVehiclePart().getVehiclePartName() : "N/A";
                            BigDecimal unitPrice = record.getVehiclePart() != null ? 
                                record.getVehiclePart().getUnitPrice() : BigDecimal.ZERO;
                            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(record.getQuantityUsed()));
                            
                            invoiceDetails.append(String.format("  - %s: %d x %s = %s VNĐ\n",
                                partName, record.getQuantityUsed(), unitPrice, totalPrice));
                        }
                    }
                }
            }

            String emailSubject = AppointmentConstants.EMAIL_SUBJECT_PENDING_PAYMENT;
            String emailBody = String.format(
                AppointmentConstants.EMAIL_BODY_PENDING_PAYMENT_GREETING +
                AppointmentConstants.EMAIL_BODY_PENDING_PAYMENT_CONTENT +
                AppointmentConstants.EMAIL_BODY_PENDING_PAYMENT_APPOINTMENT_INFO +
                AppointmentConstants.EMAIL_BODY_PENDING_PAYMENT_APPOINTMENT_ID +
                AppointmentConstants.EMAIL_BODY_PENDING_PAYMENT_VEHICLE +
                AppointmentConstants.EMAIL_BODY_PENDING_PAYMENT_INVOICE_INFO +
                invoiceDetails.toString() +
                AppointmentConstants.EMAIL_BODY_PENDING_PAYMENT_FOOTER,
                appointment.getCustomerFullName(),
                appointment.getAppointmentId(),
                appointment.getVehicleNumberPlate()
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(appointment.getCustomerEmail())
                    .subject(emailSubject)
                    .text(emailBody)
                    .fullName(appointment.getCustomerFullName())
                    .code(null)
                    .build();

            emailService.sendEmailTemplate(emailRequest);
            log.info(AppointmentConstants.LOG_INFO_SENT_PENDING_PAYMENT_EMAIL, appointment.getCustomerEmail());
        } catch (Exception e) {
            log.error(AppointmentConstants.LOG_ERR_FAILED_SEND_PENDING_PAYMENT_EMAIL, e.getMessage());
        }
    }

    /**
     * Tự động cập nhật shift status sang IN_PROGRESS khi appointment chuyển sang IN_PROGRESS
     * Để kỹ thuật viên có thể thấy ca làm mới trong danh sách "Ca làm của tôi"
     */
    private void updateShiftStatusWhenAppointmentInProgress(UUID appointmentId) {
        try {
            // Tìm tất cả shifts liên quan đến appointment này
            Page<ShiftEntity> shiftPage = shiftRepository.findByAppointmentId(appointmentId, 
                    org.springframework.data.domain.PageRequest.of(0, 100)); // Lấy tối đa 100 shifts
            
            List<ShiftEntity> shifts = shiftPage.getContent();
            
            if (shifts.isEmpty()) {
                log.debug("No shifts found for appointment {} to update", appointmentId);
                return;
            }
            
            // Cập nhật tất cả shifts có status SCHEDULED hoặc PENDING_ASSIGNMENT sang IN_PROGRESS
            int updatedCount = 0;
            for (ShiftEntity shift : shifts) {
                if (shift.getStatus() == ShiftStatusEnum.SCHEDULED || 
                    shift.getStatus() == ShiftStatusEnum.PENDING_ASSIGNMENT ||
                    shift.getStatus() == ShiftStatusEnum.LATE_ASSIGNMENT) {
                    shift.setStatus(ShiftStatusEnum.IN_PROGRESS);
                    // Cập nhật search field để bao gồm status mới
                    String search = com.fpt.evcare.utils.UtilFunction.concatenateSearchField(
                            shift.getAppointment() != null ? shift.getAppointment().getCustomerFullName() : "",
                            shift.getAppointment() != null ? shift.getAppointment().getVehicleNumberPlate() : "",
                            "IN_PROGRESS"
                    );
                    shift.setSearch(search);
                    shiftRepository.save(shift);
                    updatedCount++;
                    log.info("✅ Auto-updated shift {} status to IN_PROGRESS when appointment {} changed to IN_PROGRESS", 
                            shift.getShiftId(), appointmentId);
                }
            }
            
            if (updatedCount > 0) {
                log.info("✅ Updated {} shift(s) to IN_PROGRESS for appointment {}", updatedCount, appointmentId);
            } else {
                log.debug("No shifts needed status update for appointment {} (all shifts are already IN_PROGRESS or other status)", appointmentId);
            }
        } catch (Exception e) {
            log.error("⚠️ Failed to update shift status when appointment {} changed to IN_PROGRESS: {}", 
                    appointmentId, e.getMessage());
            // Không throw exception để không block việc update appointment status
        }
    }

    /**
     * Hủy appointment cho customer - chỉ cho phép khi appointment ở trạng thái PENDING
     */
    @Override
    @Transactional
    public void cancelAppointmentForCustomer(UUID id) {
        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(id);
        if (appointmentEntity == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, id);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        // Chỉ cho phép hủy khi appointment ở trạng thái PENDING
        if (appointmentEntity.getStatus() != AppointmentStatusEnum.PENDING) {
            log.warn(AppointmentConstants.LOG_ERR_CANNOT_CANCEL_NON_PENDING_APPOINTMENT, appointmentEntity.getStatus());
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_CANNOT_CANCEL_NON_PENDING_APPOINTMENT);
        }

        // Sử dụng updateAppointmentStatus để đảm bảo logic xử lý đầy đủ (email, notification, maintenance, etc.)
        updateAppointmentStatus(id, AppointmentStatusEnum.CANCELLED.toString());
        
        log.info(AppointmentConstants.LOG_SUCCESS_CANCELLING_APPOINTMENT_CUSTOMER, id);
    }

    /**
     * Gửi OTP cho guest appointment
     */
    @Override
    public void sendOtpForGuestAppointment(UUID appointmentId, String email) {
        AppointmentEntity appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentId);
        if (appointment == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, appointmentId);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        // Kiểm tra email có khớp với appointment không
        if (!email.equalsIgnoreCase(appointment.getCustomerEmail())) {
            log.warn("Email {} does not match appointment {} email {}", email, appointmentId, appointment.getCustomerEmail());
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_EMAIL_NOT_MATCH);
        }

        // Xóa OTP cũ nếu có (để tránh có nhiều mã OTP hợp lệ cùng lúc)
        String otpKey = getGuestOtpKey(appointmentId, email);
        if (redisService.getValue(otpKey) != null) {
            redisService.delete(otpKey);
            log.info("Đã xóa mã OTP cũ cho appointment {} và email {}", appointmentId, email);
        }

        // Tạo OTP mới
        String otp = generateOtp();
        redisService.save(otpKey, otp, OTP_TTL_MINUTES, java.util.concurrent.TimeUnit.MINUTES);

        // Gửi email OTP với nội dung phù hợp
        try {
            String appointmentInfo = String.format(
                    "Mã cuộc hẹn: %s\n" +
                    "Thời gian hẹn: %s\n" +
                    "Biển số xe: %s",
                    appointment.getAppointmentId().toString().substring(0, 8).toUpperCase(),
                    appointment.getScheduledAt() != null ? 
                        appointment.getScheduledAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "Chưa xác định",
                    appointment.getVehicleNumberPlate() != null ? appointment.getVehicleNumberPlate() : "Chưa có"
            );

            EmailRequestDTO emailRequest = EmailRequestDTO.builder()
                    .to(email)
                    .subject("Mã xác thực để xem chi tiết cuộc hẹn - EV Care")
                    .text(String.format(
                            "Xin chào %s,\n\n" +
                            "Bạn đã yêu cầu mã xác thực để xem chi tiết cuộc hẹn của bạn trên hệ thống EV Care.\n\n" +
                            "Thông tin cuộc hẹn:\n%s\n\n" +
                            "Vui lòng sử dụng mã xác thực bên dưới để truy cập và xem chi tiết cuộc hẹn này.\n\n" +
                            "Nếu bạn không yêu cầu mã xác thực này, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ của chúng tôi ngay lập tức.\n\n" +
                            "Trân trọng,\nEV Care Team",
                            appointment.getCustomerFullName(),
                            appointmentInfo
                    ))
                    .fullName(appointment.getCustomerFullName())
                    .code(otp)
                    .build();
            emailService.sendEmailTemplate(emailRequest);
            log.info(AppointmentConstants.LOG_SUCCESS_SEND_OTP_FOR_GUEST, appointmentId);
        } catch (Exception e) {
            log.error("Failed to send OTP email for appointment {}: {}", appointmentId, e.getMessage());
            throw new ResourceNotFoundException("Không thể gửi email OTP. Vui lòng thử lại sau.");
        }
    }

    /**
     * Verify OTP và trả về appointment details cho guest
     */
    @Override
    public AppointmentResponse verifyOtpForGuestAppointment(UUID appointmentId, String email, String otp) {
        AppointmentEntity appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(appointmentId);
        if (appointment == null) {
            log.warn(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND, appointmentId);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }

        // Kiểm tra email có khớp không
        if (!email.equalsIgnoreCase(appointment.getCustomerEmail())) {
            log.warn("Email {} does not match appointment {} email {}", email, appointmentId, appointment.getCustomerEmail());
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_EMAIL_NOT_MATCH);
        }

        // Verify OTP (không xóa OTP ngay, chỉ xóa sau khi update thành công)
        String otpKey = getGuestOtpKey(appointmentId, email);
        String storedOtp = redisService.getValue(otpKey);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            log.warn(AppointmentConstants.LOG_ERR_OTP_INVALID, appointmentId);
            throw new EntityValidationException(AppointmentConstants.MESSAGE_ERR_OTP_INVALID);
        }

        // Không xóa OTP ở đây - sẽ xóa sau khi update thành công
        // OTP sẽ tự động expire sau OTP_TTL_MINUTES

        // Trả về appointment details
        AppointmentResponse response = appointmentMapper.toResponse(appointment);
        
        // Map đầy đủ vehicle type response (vì mapper ignore field này)
        VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
        if (appointment.getVehicleTypeEntity() != null) {
            vehicleTypeResponse.setVehicleTypeId(appointment.getVehicleTypeEntity().getVehicleTypeId());
            vehicleTypeResponse.setVehicleTypeName(appointment.getVehicleTypeEntity().getVehicleTypeName());
            vehicleTypeResponse.setBatteryCapacity(appointment.getVehicleTypeEntity().getBatteryCapacity());
            vehicleTypeResponse.setMaintenanceIntervalKm(appointment.getVehicleTypeEntity().getMaintenanceIntervalKm());
            vehicleTypeResponse.setMaintenanceIntervalMonths(appointment.getVehicleTypeEntity().getMaintenanceIntervalMonths());
            vehicleTypeResponse.setManufacturer(appointment.getVehicleTypeEntity().getManufacturer());
            vehicleTypeResponse.setModelYear(appointment.getVehicleTypeEntity().getModelYear());
            vehicleTypeResponse.setDescription(appointment.getVehicleTypeEntity().getDescription());
        }
        response.setVehicleTypeResponse(vehicleTypeResponse);
        
        // Map service types
        response.setServiceTypeResponses(getServiceTypeResponsesForAppointment(appointment));
        
        // Map technicians
        List<UserResponse> technicianEntities = new ArrayList<>();
        appointment.getTechnicianEntities().forEach(technicianEntity -> {
            UserResponse technicianResponse = mapUserEntityToResponse(technicianEntity);
            technicianEntities.add(technicianResponse);
        });
        response.setTechnicianResponses(technicianEntities);
        
        // Map assignee
        UserEntity assignee = appointment.getAssignee();
        response.setAssignee(mapUserEntityToResponse(assignee));
        
        log.info(AppointmentConstants.LOG_SUCCESS_VERIFY_OTP_FOR_GUEST, appointmentId);
        return response;
    }


    /**
     * Helper method to force initialization of lazy-loaded appointment relationships
     * This must be called within an active transaction
     */
    private void initializeAppointmentRelations(AppointmentEntity appointment) {
        if (appointment == null) {
            return;
        }
        
        // Initialize all lazy-loaded relationships
        if (appointment.getCustomer() != null) {
            appointment.getCustomer().getUserId(); // Access to trigger loading
        }
        if (appointment.getAssignee() != null) {
            appointment.getAssignee().getUserId(); // Access to trigger loading
        }
        if (appointment.getTechnicianEntities() != null) {
            appointment.getTechnicianEntities().size(); // Access to trigger loading
            appointment.getTechnicianEntities().forEach(tech -> tech.getUserId()); // Load each technician
        }
        if (appointment.getServiceTypeEntities() != null) {
            appointment.getServiceTypeEntities().size(); // Access to trigger loading
        }
        if (appointment.getVehicleTypeEntity() != null) {
            appointment.getVehicleTypeEntity().getVehicleTypeId(); // Access to trigger loading
        }
    }

    private String generateOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private String getGuestOtpKey(UUID appointmentId, String email) {
        return GUEST_OTP_REDIS_KEY_PREFIX + appointmentId + ":" + email.toLowerCase();
    }
}
