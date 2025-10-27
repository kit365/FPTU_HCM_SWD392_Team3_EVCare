package com.fpt.evcare.serviceimpl;


import com.fpt.evcare.constants.*;
import com.fpt.evcare.dto.request.maintain_record.CreationMaintenanceRecordRequest;
import com.fpt.evcare.dto.request.maintenance_management.CreationMaintenanceManagementRequest;
import com.fpt.evcare.dto.request.maintenance_management.UpdationMaintenanceManagementRequest;
import com.fpt.evcare.dto.response.*;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.MaintenanceManagementStatusEnum;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.exception.AppointmentValidationException;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.AppointmentMapper;
import com.fpt.evcare.mapper.MaintenanceManagementMapper;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.MaintenanceManagementRepository;
import com.fpt.evcare.repository.ServiceTypeRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.MaintenanceCostService;
import com.fpt.evcare.service.MaintenanceManagementService;
import com.fpt.evcare.service.MaintenanceRecordService;
import com.fpt.evcare.service.VehiclePartService;
import com.fpt.evcare.utils.UtilFunction;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MaintenanceManagementServiceImpl implements MaintenanceManagementService {

    MaintenanceCostService maintenanceCostService;
    MaintenanceManagementRepository maintenanceManagementRepository;
    MaintenanceManagementMapper maintenanceManagementMapper;
    MaintenanceRecordService maintenanceRecordService;
    AppointmentMapper appointmentMapper;
    UserRepository userRepository;
    AppointmentRepository appointmentRepository;
    VehiclePartService vehiclePartService;
    ServiceTypeRepository serviceTypeRepository;

    @Override
    public List<String> getMaintenanceManagementStatuses(){
        List<String> statuses = new ArrayList<>();
        statuses.add(MaintenanceManagementStatusEnum.PENDING.name());
        statuses.add(MaintenanceManagementStatusEnum.IN_PROGRESS.name());
        statuses.add(MaintenanceManagementStatusEnum.COMPLETED.name());

        log.info(MaintenanceManagementConstants.LOG_INFO_SHOWING_STATUS);
        return statuses;
    }

    @Override
    public MaintenanceManagementResponse getMaintenanceManagementEntityById(String keyword, Pageable pageable, UUID id) {
        MaintenanceManagementEntity maintenanceManagementEntity = getMaintenanceManagementEntity(id);

        MaintenanceManagementResponse maintenanceManagementResponse = maintenanceManagementMapper.toResponse(maintenanceManagementEntity);
        if(maintenanceManagementEntity.getAppointment() != null){
            //Map data của appointment
            AppointmentEntity appointmentEntity = maintenanceManagementEntity.getAppointment();
            AppointmentResponse appointmentResponse = mapAllExistedUserDataInAppointment(appointmentEntity);
            maintenanceManagementResponse.setAppointmentResponse(appointmentResponse);

            //Map data vehicle type
            VehicleTypeEntity vehicleType = appointmentEntity.getVehicleTypeEntity();
            if(vehicleType != null){
                VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
                vehicleTypeResponse.setVehicleTypeId(vehicleType.getVehicleTypeId());
                vehicleTypeResponse.setVehicleTypeName(vehicleType.getVehicleTypeName());
                vehicleTypeResponse.setModelYear(vehicleType.getModelYear());
                vehicleTypeResponse.setManufacturer(vehicleType.getManufacturer());

                appointmentResponse.setVehicleTypeResponse(vehicleTypeResponse);
            }

            ServiceTypeEntity serviceTypeEntity = maintenanceManagementEntity.getServiceType();
            ServiceTypeResponse serviceTypeResponse = new ServiceTypeResponse();
            serviceTypeResponse.setServiceTypeId(serviceTypeEntity.getServiceTypeId());
            serviceTypeResponse.setServiceName(serviceTypeEntity.getServiceName());
            maintenanceManagementResponse.setServiceTypeResponse(serviceTypeResponse);

            // tham số keyword, pageable để search maintenance record trong bảng lớn maintenance management id
            maintenanceManagementResponse.setMaintenanceRecords(maintenanceRecordService.searchMaintenanceRecordByMaintenanceManagement(id, keyword, pageable));
        }

        log.info(MaintenanceManagementConstants.LOG_INFO_SHOWING_MAINTENANCE_MANAGEMENT + id);
        return maintenanceManagementResponse;
    }

    // Show toàn bộ các maintenance management (ADMIN)
    @Override
    public PageResponse<MaintenanceManagementResponse> searchMaintenanceManagement(String keyword, Pageable pageable) {
        Page<MaintenanceManagementEntity> maintenanceManagementEntityPage;

        if(keyword == null || keyword.isEmpty()){
            maintenanceManagementEntityPage = maintenanceManagementRepository.findAllByIsDeletedFalse(pageable);
        } else {
            maintenanceManagementEntityPage = maintenanceManagementRepository.findAllBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }

        if(maintenanceManagementEntityPage.getTotalElements() < 0){
            log.info(MaintenanceManagementConstants.LOG_ERR_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND);
            throw new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND);
        }

        List<MaintenanceManagementResponse> maintenanceManagementResponses = maintenanceManagementEntityPage.map(maintenanceManagement -> {
            MaintenanceManagementResponse maintenanceManagementResponse =  maintenanceManagementMapper.toResponse(maintenanceManagement);

            AppointmentEntity appointment = maintenanceManagement.getAppointment();
            if(appointment != null){
                AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointment);

                VehicleTypeEntity vehicleType = appointment.getVehicleTypeEntity();
                if(vehicleType != null){
                    VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
                    vehicleTypeResponse.setVehicleTypeId(vehicleType.getVehicleTypeId());
                    vehicleTypeResponse.setVehicleTypeName(vehicleType.getVehicleTypeName());
                    vehicleTypeResponse.setModelYear(vehicleType.getModelYear());
                    vehicleTypeResponse.setManufacturer(vehicleType.getManufacturer());

                    appointmentResponse.setVehicleTypeResponse(vehicleTypeResponse);
                }
                maintenanceManagementResponse.setAppointmentResponse(appointmentResponse);
            }

            ServiceTypeEntity serviceTypeEntity = maintenanceManagement.getServiceType();
            ServiceTypeResponse serviceTypeResponse = new ServiceTypeResponse();
            serviceTypeResponse.setServiceTypeId(serviceTypeEntity.getServiceTypeId());
            serviceTypeResponse.setServiceName(serviceTypeEntity.getServiceName());
            maintenanceManagementResponse.setServiceTypeResponse(serviceTypeResponse);

            return maintenanceManagementResponse;
        }).getContent();

        log.info(MaintenanceManagementConstants.LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST_FOR_ADMIN);
        return PageResponse.<MaintenanceManagementResponse>builder()
                .data(maintenanceManagementResponses)
                .page(maintenanceManagementEntityPage.getNumber())
                .totalElements(maintenanceManagementEntityPage.getTotalElements())
                .totalPages(maintenanceManagementEntityPage.getTotalPages())
                .build();
    }

    // Show toàn bộ các maintenance management thuộc về kỹ thuật viên (TECHNICIAN) đó
    @Override
    public PageResponse<MaintenanceManagementResponse> searchMaintenanceManagementForTechnicians(UUID technicianId, String keyword, Pageable pageable) {
        UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(technicianId);
        if(technician == null) {
            log.warn(UserConstants.LOG_ERR_USER_NOT_FOUND + technicianId);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        //Kiểm tra user có phải role technician không
        boolean isTechnician = technician.getRoles()
                .stream()
                .anyMatch(role -> role.getRoleName().equals(RoleEnum.TECHNICIAN));

        if (!isTechnician) {
            log.warn(UserConstants.LOG_ERR_USER_ROLE_NOT_MATCH + technicianId);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_ROLE_NOT_MATCH);
        }

        Page<MaintenanceManagementEntity> maintenanceManagementEntityPage;

        if(keyword == null || keyword.isEmpty()){
            maintenanceManagementEntityPage = maintenanceManagementRepository.findAllMaintenanceManagementForTechnician(technicianId, pageable);
        } else {
            maintenanceManagementEntityPage = maintenanceManagementRepository.findAllMaintenanceManagementForTechnicianByKeyword(technicianId, keyword, pageable);
        }

        if(maintenanceManagementEntityPage.getTotalElements() < 0){
            log.info(MaintenanceManagementConstants.LOG_ERR_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND);
            throw new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND);
        }

        List<MaintenanceManagementResponse> maintenanceManagementResponses = maintenanceManagementEntityPage.map(maintenanceManagement -> {
            MaintenanceManagementResponse maintenanceManagementResponse =  maintenanceManagementMapper.toResponse(maintenanceManagement);

            AppointmentEntity appointment = maintenanceManagement.getAppointment();
            if(appointment != null){
                AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointment);

                VehicleTypeEntity vehicleType = appointment.getVehicleTypeEntity();
                if(vehicleType != null){
                    VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
                    vehicleTypeResponse.setVehicleTypeId(vehicleType.getVehicleTypeId());
                    vehicleTypeResponse.setVehicleTypeName(vehicleType.getVehicleTypeName());
                    vehicleTypeResponse.setModelYear(vehicleType.getModelYear());
                    vehicleTypeResponse.setManufacturer(vehicleType.getManufacturer());

                    appointmentResponse.setVehicleTypeResponse(vehicleTypeResponse);
                }
                maintenanceManagementResponse.setAppointmentResponse(appointmentResponse);
            }

            ServiceTypeEntity serviceTypeEntity = maintenanceManagement.getServiceType();
            ServiceTypeResponse serviceTypeResponse = new ServiceTypeResponse();
            serviceTypeResponse.setServiceTypeId(serviceTypeEntity.getServiceTypeId());
            serviceTypeResponse.setServiceName(serviceTypeEntity.getServiceName());
            maintenanceManagementResponse.setServiceTypeResponse(serviceTypeResponse);

            return maintenanceManagementResponse;
        }).getContent();

        log.info(MaintenanceManagementConstants.LOG_SUCCESS_SHOWING_MAINTENANCE_MANAGEMENT_LIST_FOR_TECHNICIAN + technicianId);
        return PageResponse.<MaintenanceManagementResponse>builder()
                .data(maintenanceManagementResponses)
                .page(maintenanceManagementEntityPage.getNumber())
                .totalElements(maintenanceManagementEntityPage.getTotalElements())
                .totalPages(maintenanceManagementEntityPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public void addMaintenanceManagement(CreationMaintenanceManagementRequest creationMaintenanceManagementRequest) {
        MaintenanceManagementEntity maintenanceManagementEntity = maintenanceManagementMapper.toEntity(creationMaintenanceManagementRequest);

        AppointmentEntity appointmentEntity = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(creationMaintenanceManagementRequest.getAppointmentId());
        if (appointmentEntity == null) {
            log.info(AppointmentConstants.LOG_ERR_APPOINTMENT_NOT_FOUND);
            throw new ResourceNotFoundException(AppointmentConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
        }
        maintenanceManagementEntity.setAppointment(appointmentEntity);

        maintenanceManagementEntity.setStatus(MaintenanceManagementStatusEnum.PENDING);

        String search = UtilFunction.concatenateSearchField(appointmentEntity.getSearch());
        maintenanceManagementEntity.setSearch(search);

        //Set loại dịch vụ
        ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(creationMaintenanceManagementRequest.getServiceTypeId());

        // Nếu truyền nhầm service con, nó vẫn map đúng về cha.
        if (serviceType.getParent() != null) {
            serviceType = serviceType.getParent();
        }

        if(serviceType == null){
            log.info(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND + creationMaintenanceManagementRequest.getServiceTypeId());
            log.warn(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }
        maintenanceManagementEntity.setServiceType(serviceType);

        log.info(MaintenanceManagementConstants.LOG_INFO_CREATING_MAINTENANCE_MANAGEMENT, appointmentEntity.getCustomerFullName());

        //Lưu maintenance management để có id cho các record con
        MaintenanceManagementEntity maintenanceManagement = maintenanceManagementRepository.save(maintenanceManagementEntity);

        //Thực hiện add thông tin của phiếu bảo dưỡng khi appointment được duyệt
        List<CreationMaintenanceRecordRequest> creationMaintenanceRecordRequests = creationMaintenanceManagementRequest.getCreationMaintenanceRecordRequests();
        if(creationMaintenanceRecordRequests == null || creationMaintenanceRecordRequests.isEmpty()){
            log.warn(MaintenanceManagementConstants.LOG_ERR_CREATION_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND);
            throw new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_CREATION_MAINTENANCE_MANAGEMENT_LIST_NOT_FOUND);
        }
        maintenanceRecordService.addMaintenanceRecordsForMaintenanceManagement(maintenanceManagement, creationMaintenanceRecordRequests);
    }

    @Override
    @Transactional
    public boolean updateStartEndStartMaintenanceManagement(UUID id, UpdationMaintenanceManagementRequest request) {
        MaintenanceManagementEntity entity = getMaintenanceManagementEntity(id);

        // Kiểm tra hợp lệ: endTime phải sau startTime
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new EntityValidationException(MaintenanceManagementConstants.LOG_ERR_END_TIME_INVALID);
        }

        // Cập nhật hai field chính
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());

        // Lưu lại vào DB
        maintenanceManagementRepository.save(entity);

        log.info(MaintenanceManagementConstants.LOG_INFO_UPDATING_MAINTENANCE_MANAGEMENT_TIME + id);
        return true;
    }

    @Override
    @Transactional
    public boolean updateNotesMaintenanceManagement(UUID id, String notes) {
        MaintenanceManagementEntity maintenanceManagement = getMaintenanceManagementEntity(id);

        maintenanceManagement.setNotes(notes);

        log.info(MaintenanceManagementConstants.LOG_INFO_UPDATING_MAINTENANCE_MANAGEMENT_NOTES + id);
        maintenanceManagementRepository.save(maintenanceManagement);

        return true;
    }

    @Override
    @Transactional
    public boolean updateMaintenanceManagementStatus(UUID id, String status) {
        MaintenanceManagementStatusEnum newStatus = isValidMaintenanceManagementStatus(status);
        MaintenanceManagementEntity maintenanceManagement = getMaintenanceManagementEntity(id);

        MaintenanceManagementStatusEnum currentStatus = maintenanceManagement.getStatus();
        AppointmentEntity appointment = maintenanceManagement.getAppointment();

        // Kiểm tra quy tắc chuyển trạng thái hợp lệ
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            log.warn(MaintenanceManagementConstants.LOG_ERR_INVALID_STATUS_TRANSITION, currentStatus, newStatus);
            throw new EntityValidationException(MaintenanceManagementConstants.MESSAGE_ERR_INVALID_STATUS_TRANSITION);
        }

        // ====== CASE 1: Khi chuyển sang IN_PROGRESS ======
        if (newStatus == MaintenanceManagementStatusEnum.IN_PROGRESS) {
            List<MaintenanceRecordEntity> maintenanceRecords = maintenanceManagement.getMaintenanceRecords();

            if (!maintenanceRecords.isEmpty()) {
                maintenanceRecords.forEach(record -> {
                    Integer quantityUsed = record.getQuantityUsed();
                    VehiclePartEntity vehiclePart = record.getVehiclePart();

                    if (vehiclePart.getCurrentQuantity() < quantityUsed) {
                        log.warn(VehiclePartConstants.LOG_ERR_INSUFFICIENT_VEHICLE_PART_STOCK, vehiclePart.getVehiclePartName());
                        throw new EntityValidationException(VehiclePartConstants.MESSAGE_ERR_INSUFFICIENT_VEHICLE_PART_STOCK);
                    }

                    // Trừ số lượng phụ tùng trong kho
                    vehiclePartService.subtractQuantity(vehiclePart.getVehiclePartId(), quantityUsed);
                });

                // Cập nhật lại tổng chi phí bảo trì
                maintenanceManagementRepository.flush();
                maintenanceCostService.updateTotalCost(maintenanceManagement);
            }
        }

        // ====== CASE 2: Khi chuyển sang COMPLETED ======
        if (newStatus == MaintenanceManagementStatusEnum.COMPLETED) {
            // Chỉ cho phép chuyển từ IN_PROGRESS -> COMPLETED
            if (currentStatus != MaintenanceManagementStatusEnum.IN_PROGRESS) {
                log.warn(MaintenanceManagementConstants.LOG_ERR_CURRENT_STATUS_IS_NOT_SUITABLE_FOR_COMPLETION);
                throw new EntityValidationException(MaintenanceManagementConstants.MESSAGE_ERR_CURRENT_STATUS_IS_NOT_SUITABLE_FOR_COMPLETION);
            }

            // Kiểm tra toàn bộ maintenance record đã được user duyệt chưa
            List<MaintenanceRecordEntity> maintenanceRecords = maintenanceManagement.getMaintenanceRecords();
            boolean allApproved = maintenanceRecords.stream()
                    .allMatch(record -> Boolean.TRUE.equals(record.getApprovedByUser()));

            if (!allApproved) {
                log.warn(MaintenanceManagementConstants.LOG_ERR_NOT_ALL_RECORDS_APPROVED_BY_USER, maintenanceManagement.getMaintenanceManagementId());
                throw new EntityValidationException(MaintenanceManagementConstants.MESSAGE_ERR_NOT_ALL_RECORDS_APPROVED_BY_USER);
            }

            // Cập nhật trạng thái maintenance management
            maintenanceManagement.setStatus(MaintenanceManagementStatusEnum.COMPLETED);
            maintenanceManagementRepository.save(maintenanceManagement);
            log.info(MaintenanceManagementConstants.LOG_INFO_UPDATING_MAINTENANCE_MANAGEMENT_STATUS, id);

            // Nếu tất cả maintenance management trong appointment đã COMPLETED => tự động cập nhật appointment sang COMPLETED
            boolean allCompleted = maintenanceManagementRepository
                    .findByAppointmentIdAndIsDeletedFalse(appointment.getAppointmentId())
                    .stream()
                    .allMatch(m -> m.getStatus() == MaintenanceManagementStatusEnum.COMPLETED);

            if (allCompleted && appointment.getStatus() == AppointmentStatusEnum.IN_PROGRESS) {
                appointment.setStatus(AppointmentStatusEnum.COMPLETED);
                appointmentRepository.save(appointment);
                log.info(AppointmentConstants.LOG_INFO_APPOINTMENT_STATUS_AUTO_COMPLETED,
                        appointment.getAppointmentId(), AppointmentStatusEnum.COMPLETED);
            }
            return true;
        }

        // ====== CASE 3: Các trạng thái khác hợp lệ ======
        maintenanceManagement.setStatus(newStatus);
        maintenanceManagementRepository.save(maintenanceManagement);
        log.info(MaintenanceManagementConstants.LOG_INFO_UPDATING_MAINTENANCE_MANAGEMENT_STATUS, id);
        return true;
    }

    /**
     * Kiểm tra quy tắc chuyển trạng thái hợp lệ
     * - PENDING -> IN_PROGRESS (được phép)
     * - IN_PROGRESS -> COMPLETED (được phép)
     * - Hoàn toàn cấm quay ngược (ví dụ: IN_PROGRESS -> PENDING)
     * - Không cho nhảy cóc (ví dụ: PENDING -> COMPLETED)
     */
    private boolean isValidStatusTransition(MaintenanceManagementStatusEnum current, MaintenanceManagementStatusEnum target) {
        return switch (current) {
            case PENDING -> target == MaintenanceManagementStatusEnum.IN_PROGRESS;
            case IN_PROGRESS -> target == MaintenanceManagementStatusEnum.COMPLETED;
            case COMPLETED -> false; // Không thể cập nhật sau khi hoàn thành
            default -> false;
        };
    }

    private MaintenanceManagementEntity getMaintenanceManagementEntity(UUID id) {
        MaintenanceManagementEntity maintenanceManagement = maintenanceManagementRepository.findByMaintenanceManagementIdAndIsDeletedFalse(id);
        if (maintenanceManagement == null) {
            log.warn(MaintenanceManagementConstants.LOG_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND + id);
            throw new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND);
        }
        return maintenanceManagement;
    }

    private AppointmentResponse mapAllExistedUserDataInAppointment(AppointmentEntity appointmentEntity) {
        AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);

        //Set thông tin khách hàng
        if(appointmentEntity.getCustomer() != null){
            UserEntity customer = appointmentEntity.getCustomer();
            UserResponse customerResponse = new UserResponse();
            customerResponse.setUserId(customer.getUserId());

            appointmentResponse.setCustomer(customerResponse);
        }

        //Set danh sách kỹ thuật viên có trong lịch bảo dưỡng đó
        List<UserResponse> technicianEntities = new ArrayList<>();
        if(appointmentEntity.getTechnicianEntities() != null){
            for(UserEntity technician : appointmentEntity.getTechnicianEntities()){
                UserResponse technicianResponse = new UserResponse();
                technicianResponse.setUserId(technician.getUserId());
                technicianResponse.setFullName(technician.getFullName());
                technicianResponse.setNumberPhone(technician.getNumberPhone());
                technicianResponse.setEmail(technician.getEmail());
                technicianResponse.setAvatarUrl(technician.getAvatarUrl());
                technicianEntities.add(technicianResponse);
            }
            appointmentResponse.setTechnicianResponses(technicianEntities);
        }

        //Set thông tin của người phân công
        if(appointmentEntity.getAssignee() != null){
            UserEntity assignee = appointmentEntity.getAssignee();
            UserResponse assigneeResponse = new UserResponse();
            assigneeResponse.setUserId(assignee.getUserId());
            assigneeResponse.setFullName(assignee.getFullName());
            assigneeResponse.setNumberPhone(assignee.getNumberPhone());
            assigneeResponse.setEmail(assignee.getEmail());
            assigneeResponse.setAvatarUrl(assignee.getAvatarUrl());

            appointmentResponse.setAssignee(assigneeResponse);
        }

        if(appointmentEntity.getVehicleTypeEntity() != null){
            VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
            vehicleTypeResponse.setVehicleTypeId(appointmentEntity.getVehicleTypeEntity().getVehicleTypeId());
            vehicleTypeResponse.setVehicleTypeName(appointmentEntity.getVehicleTypeEntity().getVehicleTypeName());
            vehicleTypeResponse.setModelYear(appointmentEntity.getVehicleTypeEntity().getModelYear());
            vehicleTypeResponse.setManufacturer(appointmentEntity.getVehicleTypeEntity().getManufacturer());

            appointmentResponse.setVehicleTypeResponse(vehicleTypeResponse);
        }

        return appointmentResponse;
    }

    private MaintenanceManagementStatusEnum isValidMaintenanceManagementStatus(String status) {
        if (status == null || status.isBlank()) {
            log.warn(MaintenanceManagementConstants.LOG_ERR_INVALID_STATUS + status);
            throw new AppointmentValidationException(MaintenanceManagementConstants.MESSAGE_ERR_INVALID_STATUS);
        }

        try {
            return MaintenanceManagementStatusEnum.valueOf(status.toUpperCase()); // Chuyển sang chữ hoa để tránh lỗi case-sensitive
        } catch (IllegalArgumentException e) {
            log.warn(MaintenanceManagementConstants.LOG_ERR_INVALID_STATUS + status);
            throw new EntityValidationException(MaintenanceManagementConstants.LOG_ERR_INVALID_STATUS);
        }
    }
}
