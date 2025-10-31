package com.fpt.evcare.serviceimpl;
import com.fpt.evcare.constants.ShiftConstants;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.request.shift.AssignShiftRequest;
import com.fpt.evcare.dto.request.shift.CheckTechnicianAvailabilityRequest;
import com.fpt.evcare.dto.request.shift.CreationShiftRequest;
import com.fpt.evcare.dto.request.shift.UpdationShiftRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ShiftResponse;
import com.fpt.evcare.dto.response.TechnicianAvailabilityResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.ShiftEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.enums.ShiftStatusEnum;
import com.fpt.evcare.enums.ShiftTypeEnum;
import com.fpt.evcare.exception.BusinessException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.ShiftMapper;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.ShiftRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.AppointmentService;
import com.fpt.evcare.service.ShiftService;
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
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShiftServiceImpl implements ShiftService {
    ShiftRepository shiftRepository;
    AppointmentRepository appointmentRepository;
    AppointmentService appointmentService;
    ShiftMapper shiftMapper;
    UserRepository userRepository;
    UserMapper userMapper;

    @Override
    public List<String> getAllShiftTypes() {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_TYPE_LIST);
        return UtilFunction.getEnumValues(ShiftTypeEnum.class);
    }

    @Override
    public List<String> getAllShiftStatuses() {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_STATUS_LIST);
        return UtilFunction.getEnumValues(ShiftStatusEnum.class);
    }

    @Override
    public ShiftResponse getShiftById(UUID id) {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_BY_ID, id);
        
        ShiftEntity shiftEntity = shiftRepository.findByShiftIdAndIsDeletedFalse(id);
        if (shiftEntity == null) {
            log.warn(ShiftConstants.LOG_ERR_SHIFT_NOT_FOUND);
            throw new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_SHIFT_NOT_FOUND);
        }

        return shiftMapper.toResponse(shiftEntity);
    }

    @Override
    public PageResponse<ShiftResponse> searchShift(String keyword, Pageable pageable) {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_LIST);
        
        Page<ShiftEntity> shiftPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            shiftPage = shiftRepository.findByIsDeletedFalse(pageable);
        } else {
            shiftPage = shiftRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }

        List<ShiftResponse> shiftResponses = shiftPage.getContent().stream()
                .map(shiftMapper::toResponse)
                .toList();

        return PageResponse.<ShiftResponse>builder()
                .data(shiftResponses)
                .page(shiftPage.getNumber())
                .size(shiftPage.getSize())
                .totalElements(shiftPage.getTotalElements())
                .totalPages(shiftPage.getTotalPages())
                .last(shiftPage.isLast())
                .build();
    }

    @Override
    public PageResponse<ShiftResponse> getShiftsByAppointmentId(UUID appointmentId, Pageable pageable) {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_LIST_BY_APPOINTMENT_ID, appointmentId);
        
        Page<ShiftEntity> shiftPage = shiftRepository.findByAppointmentId(appointmentId, pageable);

        List<ShiftResponse> shiftResponses = shiftPage.getContent().stream()
                .map(shiftMapper::toResponse)
                .toList();

        return PageResponse.<ShiftResponse>builder()
                .data(shiftResponses)
                .page(shiftPage.getNumber())
                .size(shiftPage.getSize())
                .totalElements(shiftPage.getTotalElements())
                .totalPages(shiftPage.getTotalPages())
                .last(shiftPage.isLast())
                .build();
    }

    @Override
    public PageResponse<ShiftResponse> searchShiftForTechnician(UUID technicianId, String keyword, Pageable pageable) {
        log.info("Showing shift list for technician: {}", technicianId);
        
        // Kiểm tra technician có tồn tại không
        UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(technicianId);
        if (technician == null) {
            log.warn(ShiftConstants.MESSAGE_TECHNICIAN_NOT_FOUND);
            throw new ResourceNotFoundException(ShiftConstants.MESSAGE_TECHNICIAN_NOT_FOUND);
        }
        
        Page<ShiftEntity> shiftPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            // Tìm tất cả shifts có technician này
            shiftPage = shiftRepository.findByTechnicianIdAndIsDeletedFalse(technicianId, pageable);
        } else {
            // Tìm shifts có technician này và match keyword
            shiftPage = shiftRepository.findByTechnicianIdAndSearchContainingIgnoreCaseAndIsDeletedFalse(
                    technicianId, keyword, pageable);
        }

        List<ShiftResponse> shiftResponses = shiftPage.getContent().stream()
                .map(shiftMapper::toResponse)
                .toList();

        return PageResponse.<ShiftResponse>builder()
                .data(shiftResponses)
                .page(shiftPage.getNumber())
                .size(shiftPage.getSize())
                .totalElements(shiftPage.getTotalElements())
                .totalPages(shiftPage.getTotalPages())
                .last(shiftPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public boolean addShift(CreationShiftRequest creationShiftRequest) {
        log.info(ShiftConstants.LOG_INFO_CREATING_SHIFT);
        
        try {
            // appointmentId is now OPTIONAL (for shifts like ca trực, kiểm kê, bảo trì,...)
            AppointmentEntity appointment = null;
            if (creationShiftRequest.getAppointmentId() != null) {
                appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(
                        creationShiftRequest.getAppointmentId());

                if (appointment == null) {
                    log.warn(ShiftConstants.LOG_ERR_APPOINTMENT_NOT_FOUND);
                    throw new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
                }
            }

            ShiftEntity shiftEntity = shiftMapper.toEntity(creationShiftRequest);
            shiftEntity.setAppointment(appointment); // Can be null
            
            if (shiftEntity.getShiftType() == null) {
                shiftEntity.setShiftType(ShiftTypeEnum.APPOINTMENT);
            }
            if (shiftEntity.getStatus() == null) {
                shiftEntity.setStatus(ShiftStatusEnum.SCHEDULED);
            }
            
            // Calculate totalHours if both startTime and endTime are provided
            if (shiftEntity.getStartTime() != null && shiftEntity.getEndTime() != null) {
                BigDecimal totalHours = calculateTotalHours(shiftEntity.getStartTime(), shiftEntity.getEndTime());
                shiftEntity.setTotalHours(totalHours);
                log.info(ShiftConstants.LOG_INFO_CALCULATED_TOTAL_HOURS, totalHours);
            }
            
            shiftEntity.setSearch(buildSearchString(shiftEntity));
            
            shiftRepository.save(shiftEntity);
            
            // Only update appointment if it exists
            if (appointment != null) {
                UpdationAppointmentRequest appointmentRequest = new UpdationAppointmentRequest();
                appointmentRequest.setTechnicianId(creationShiftRequest.getTechnicianIds());
                appointmentRequest.setAssigneeId(creationShiftRequest.getAssigneeId());
                appointmentService.updateAppointmentForStaff(appointment.getAppointmentId(), appointmentRequest);
            }
            
            return true;
        } catch (Exception e) {
            log.error(ShiftConstants.LOG_ERR_CREATING_SHIFT, e);
            throw new BusinessException(ShiftConstants.MESSAGE_ERR_CREATING_SHIFT);
        }
    }

    @Override
    @Transactional
    public boolean updateShift(UUID id, UpdationShiftRequest updationShiftRequest) {
        log.info(ShiftConstants.LOG_INFO_UPDATING_SHIFT, id);
        
        try {
            ShiftEntity shiftEntity = shiftRepository.findByShiftIdAndIsDeletedFalse(id);
            if (shiftEntity == null) {
                log.warn(ShiftConstants.LOG_ERR_SHIFT_NOT_FOUND);
                throw new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_SHIFT_NOT_FOUND);
            }

            if (updationShiftRequest.getAppointmentId() != null) {
                AppointmentEntity appointment = appointmentRepository.findByAppointmentIdAndIsDeletedFalse(
                        updationShiftRequest.getAppointmentId());
                if (appointment == null) {
                    log.warn(ShiftConstants.LOG_ERR_APPOINTMENT_NOT_FOUND);
                    throw new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_APPOINTMENT_NOT_FOUND);
                }
                shiftEntity.setAppointment(appointment);
            }

            shiftMapper.toUpdate(shiftEntity, updationShiftRequest);
            
            shiftEntity.setSearch(buildSearchString(shiftEntity));
            
            shiftRepository.save(shiftEntity);
            return true;
        } catch (Exception e) {
            log.error(ShiftConstants.LOG_ERR_UPDATING_SHIFT, e);
            throw new BusinessException(ShiftConstants.MESSAGE_ERR_UPDATING_SHIFT);
        }
    }

    @Override
    @Transactional
    public boolean deleteShift(UUID id) {
        log.info(ShiftConstants.LOG_INFO_DELETING_SHIFT, id);
        
        try {
            ShiftEntity shiftEntity = shiftRepository.findByShiftIdAndIsDeletedFalse(id);
            if (shiftEntity == null) {
                log.warn(ShiftConstants.LOG_ERR_SHIFT_NOT_FOUND);
                throw new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_SHIFT_NOT_FOUND);
            }

            shiftEntity.setIsDeleted(true);
            shiftRepository.save(shiftEntity);
            return true;
        } catch (Exception e) {
            log.error(ShiftConstants.LOG_ERR_DELETING_SHIFT, e);
            throw new BusinessException(ShiftConstants.MESSAGE_ERR_DELETING_SHIFT);
        }
    }

    @Override
    @Transactional
    public boolean restoreShift(UUID id) {
        log.info(ShiftConstants.LOG_INFO_RESTORING_SHIFT, id);
        
        try {
            ShiftEntity shiftEntity = shiftRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_SHIFT_NOT_FOUND));

            shiftEntity.setIsDeleted(false);
            shiftRepository.save(shiftEntity);
            return true;
        } catch (Exception e) {
            log.error(ShiftConstants.LOG_ERR_RESTORING_SHIFT, e);
            throw new BusinessException(ShiftConstants.MESSAGE_ERR_RESTORING_SHIFT);
        }
    }

    @Override
    public List<TechnicianAvailabilityResponse> checkTechnicianAvailability(
            CheckTechnicianAvailabilityRequest request) {
        log.info(ShiftConstants.LOG_INFO_CHECKING_AVAILABILITY, request.getTechnicianIds().size());
        
        List<TechnicianAvailabilityResponse> results = new ArrayList<>();
        
        for (UUID technicianId : request.getTechnicianIds()) {
            UserEntity technician = userRepository.findByUserIdAndIsDeletedFalse(technicianId);
            
            if (technician == null) {
                results.add(TechnicianAvailabilityResponse.builder()
                        .technicianId(technicianId)
                        .technicianName("Unknown")
                        .isAvailable(false)
                        .reason(ShiftConstants.MESSAGE_TECHNICIAN_NOT_FOUND)
                        .build());
                continue;
            }
            
            // Tìm shifts trùng thời gian
            List<ShiftEntity> conflictingShifts = shiftRepository.findConflictingShiftsByTechnician(
                    technicianId,
                    request.getStartTime(),
                    request.getEndTime(),
                    request.getExcludeShiftId()
            );
            
            if (conflictingShifts.isEmpty()) {
                // Available
                results.add(TechnicianAvailabilityResponse.builder()
                        .technicianId(technicianId)
                        .technicianName(technician.getFullName() != null ? technician.getFullName() : technician.getUsername())
                        .isAvailable(true)
                        .build());
            } else {
                // Not available - có shift trùng
                ShiftEntity conflictShift = conflictingShifts.getFirst();
                results.add(TechnicianAvailabilityResponse.builder()
                        .technicianId(technicianId)
                        .technicianName(technician.getFullName() != null ? technician.getFullName() : technician.getUsername())
                        .isAvailable(false)
                        .reason(ShiftConstants.MESSAGE_TECHNICIAN_NOT_AVAILABLE)
                        .conflictShiftId(conflictShift.getShiftId())
                        .conflictStartTime(conflictShift.getStartTime())
                        .conflictEndTime(conflictShift.getEndTime())
                        .build());
            }
        }
        
        return results;
    }

    @Override
    public List<UserResponse> getAvailableTechnicians(
            LocalDateTime startTime,
            LocalDateTime endTime,
            UUID excludeShiftId) {
        log.info(ShiftConstants.LOG_INFO_GETTING_AVAILABLE_TECHNICIANS, startTime, endTime);
        
        // 1. Lấy tất cả technicians
        List<UserEntity> allTechnicians = userRepository.findByRoleNameAndIsDeletedFalse(
                RoleEnum.TECHNICIAN
        );
        
        // 2. Filter chỉ lấy available technicians
        List<UserEntity> availableTechnicians = new ArrayList<>();
        
        for (UserEntity technician : allTechnicians) {
            List<ShiftEntity> conflictingShifts = shiftRepository.findConflictingShiftsByTechnician(
                    technician.getUserId(),
                    startTime,
                    endTime,
                    excludeShiftId
            );
            
            if (conflictingShifts.isEmpty()) {
                availableTechnicians.add(technician);
            }
        }
        
        // 3. Convert to UserResponse
        return availableTechnicians.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean assignShift(UUID shiftId, AssignShiftRequest request) {
        log.info(ShiftConstants.LOG_INFO_ASSIGNING_SHIFT, shiftId);
        
        try {
            ShiftEntity shift = shiftRepository.findById(shiftId)
                    .orElseThrow(() -> new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_SHIFT_NOT_FOUND));
            
            validateShiftForAssignment(shift);
            
            UserEntity assignee = findUserEntity(request.getAssigneeId(), "Người phụ trách không tồn tại");
            UserEntity staff = findOptionalUserEntity(request.getStaffId());
            List<UserEntity> technicians = mapTechnicians(request.getTechnicianIds());
            
            updateShiftAssignment(shift, request, assignee, staff, technicians);
            logShiftAssignment(shift);
            updateRelatedAppointment(shift, assignee, technicians);
            
            log.info(ShiftConstants.LOG_INFO_SHIFT_ASSIGNMENT_COMPLETED);
            return true;
        } catch (Exception e) {
            log.error(ShiftConstants.MESSAGE_ERR_ASSIGNING_SHIFT, e);
            throw e;
        }
    }
    
    private void validateShiftForAssignment(ShiftEntity shift) {
        if (shift.getStatus() != ShiftStatusEnum.PENDING_ASSIGNMENT 
                && shift.getStatus() != ShiftStatusEnum.LATE_ASSIGNMENT) {
            throw new IllegalStateException(ShiftConstants.MESSAGE_ERR_SHIFT_NOT_PENDING);
        }
        if (shift.getAssignee() != null) {
            throw new IllegalStateException(ShiftConstants.MESSAGE_ERR_SHIFT_ALREADY_ASSIGNED);
        }
    }
    
    private UserEntity findUserEntity(UUID userId, String errorMessage) {
        UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(userId);
        if (user == null) {
            throw new ResourceNotFoundException(errorMessage);
        }
        return user;
    }
    
    private UserEntity findOptionalUserEntity(UUID userId) {
        return userId != null ? findUserEntity(userId, "Nhân viên không tồn tại") : null;
    }
    
    private List<UserEntity> mapTechnicians(List<UUID> technicianIds) {
        List<UserEntity> technicians = new ArrayList<>();
        if (technicianIds != null && !technicianIds.isEmpty()) {
            for (UUID techId : technicianIds) {
                technicians.add(findUserEntity(techId, "Kỹ thuật viên không tồn tại: " + techId));
            }
        }
        return technicians;
    }
    
    private void updateShiftAssignment(ShiftEntity shift, AssignShiftRequest request, 
                                      UserEntity assignee, UserEntity staff, List<UserEntity> technicians) {
        shift.setAssignee(assignee);
        shift.setStaff(staff);
        shift.setTechnicians(technicians);
        shift.setEndTime(request.getEndTime());
        shift.setStatus(ShiftStatusEnum.SCHEDULED);
        shift.setTotalHours(calculateTotalHours(shift.getStartTime(), shift.getEndTime()));
        shift.setSearch(buildSearchString(shift));
        shiftRepository.save(shift);
        
        log.info(ShiftConstants.LOG_INFO_CALCULATED_TOTAL_HOURS, shift.getTotalHours());
    }
    
    private void logShiftAssignment(ShiftEntity shift) {
        log.info(ShiftConstants.LOG_INFO_SHIFT_SAVED_SUCCESSFULLY, shift.getShiftId());
        log.info(ShiftConstants.LOG_INFO_SHIFT_ASSIGNEE, shift.getAssignee() != null ? shift.getAssignee().getFullName() : "null");
        log.info(ShiftConstants.LOG_INFO_SHIFT_STAFF, shift.getStaff() != null ? shift.getStaff().getFullName() : "null");
        log.info(ShiftConstants.LOG_INFO_SHIFT_TECHNICIANS_COUNT, shift.getTechnicians() != null ? shift.getTechnicians().size() : 0);
        log.info(ShiftConstants.LOG_INFO_SHIFT_STATUS, shift.getStatus());
    }
    
    private void updateRelatedAppointment(ShiftEntity shift, UserEntity assignee, List<UserEntity> technicians) {
        if (shift.getAppointment() == null) {
            log.warn(ShiftConstants.LOG_WARN_NO_APPOINTMENT_LINKED);
            return;
        }
        
        log.info(ShiftConstants.LOG_INFO_UPDATING_APPOINTMENT, shift.getAppointment().getAppointmentId());
        
        UpdationAppointmentRequest appointmentUpdate = new UpdationAppointmentRequest();
        appointmentUpdate.setAssigneeId(assignee.getUserId());
        appointmentUpdate.setTechnicianId(technicians.stream()
                .map(UserEntity::getUserId)
                .collect(Collectors.toList()));
        
        log.info(ShiftConstants.LOG_INFO_SETTING_ASSIGNEE, assignee.getUserId());
        log.info(ShiftConstants.LOG_INFO_SETTING_TECHNICIANS, appointmentUpdate.getTechnicianId().size());
        
        appointmentService.updateAppointmentForStaff(shift.getAppointment().getAppointmentId(), appointmentUpdate);
        log.info(ShiftConstants.LOG_INFO_APPOINTMENT_UPDATED_SUCCESSFULLY);
    }

    @Override
    @Transactional
    public void updateShiftStatuses() {
        log.info(ShiftConstants.LOG_INFO_SCHEDULER_RUNNING);
        LocalDateTime now = LocalDateTime.now();
        
        try {
            // 1. Update PENDING_ASSIGNMENT → LATE_ASSIGNMENT (quá giờ chưa phân công)
            List<ShiftEntity> shiftsWithLateAssignment = shiftRepository.findShiftsWithLateAssignment(now);
            log.info(ShiftConstants.LOG_INFO_FOUND_SHIFTS_LATE_ASSIGNMENT, shiftsWithLateAssignment.size());
            
            for (ShiftEntity shift : shiftsWithLateAssignment) {
                shift.setStatus(ShiftStatusEnum.LATE_ASSIGNMENT);
                shiftRepository.save(shift);
                log.info(ShiftConstants.LOG_INFO_UPDATED_SHIFT_TO_LATE_ASSIGNMENT, shift.getShiftId());
            }
            
            // 2. Update SCHEDULED → IN_PROGRESS
            List<ShiftEntity> shiftsToStart = shiftRepository.findShiftsToStartNow(now);
            log.info(ShiftConstants.LOG_INFO_FOUND_SHIFTS_TO_START, shiftsToStart.size());
            
            for (ShiftEntity shift : shiftsToStart) {
                shift.setStatus(ShiftStatusEnum.IN_PROGRESS);
                shiftRepository.save(shift);
                log.info(ShiftConstants.LOG_INFO_UPDATED_SHIFT_TO_IN_PROGRESS, shift.getShiftId());
            }
            
            // 3. Update IN_PROGRESS → COMPLETED
            List<ShiftEntity> shiftsToComplete = shiftRepository.findShiftsToCompleteNow(now);
            log.info(ShiftConstants.LOG_INFO_FOUND_SHIFTS_TO_COMPLETE, shiftsToComplete.size());
            
            for (ShiftEntity shift : shiftsToComplete) {
                shift.setStatus(ShiftStatusEnum.COMPLETED);
                shiftRepository.save(shift);
                log.info(ShiftConstants.LOG_INFO_UPDATED_SHIFT_TO_COMPLETED, shift.getShiftId());
            }
            
            log.info(ShiftConstants.LOG_INFO_SCHEDULER_COMPLETED);
        } catch (Exception e) {
            log.error(ShiftConstants.LOG_ERR_UPDATING_SHIFT_STATUSES, e);
        }
    }

    private String buildSearchString(ShiftEntity shiftEntity) {
        StringBuilder searchBuilder = new StringBuilder();
        
        if (shiftEntity.getAppointment() != null) {
            AppointmentEntity appointment = shiftEntity.getAppointment();
            searchBuilder.append(appointment.getAppointmentId()).append(" ");
            
            // Thêm thông tin khách hàng để search
            if (appointment.getCustomerFullName() != null) {
                searchBuilder.append(appointment.getCustomerFullName()).append(" ");
            }
            
            // Thêm biển số xe để search
            if (appointment.getVehicleNumberPlate() != null) {
                searchBuilder.append(appointment.getVehicleNumberPlate()).append(" ");
            }
        }
        if (shiftEntity.getShiftType() != null) {
            searchBuilder.append(shiftEntity.getShiftType().name()).append(" ");
        }
        if (shiftEntity.getStatus() != null) {
            searchBuilder.append(shiftEntity.getStatus().name()).append(" ");
        }
        if (shiftEntity.getNotes() != null) {
            searchBuilder.append(shiftEntity.getNotes()).append(" ");
        }
        
        return searchBuilder.toString().trim();
    }
    
    /**
     * Helper method: Calculate totalHours với độ chính xác thập phân
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Tổng số giờ (ví dụ: 2.5 = 2 giờ 30 phút)
     */
    private BigDecimal calculateTotalHours(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            return BigDecimal.ZERO;
        }
        
        Duration duration = Duration.between(startTime, endTime);
        double totalHoursDouble = duration.toMinutes() / 60.0;
        return BigDecimal.valueOf(totalHoursDouble).setScale(2, RoundingMode.HALF_UP);
    }
}



