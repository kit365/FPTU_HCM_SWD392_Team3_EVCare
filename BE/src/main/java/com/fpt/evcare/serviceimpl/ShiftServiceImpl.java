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
import com.fpt.evcare.exception.EntityValidationException;
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
    @Transactional(readOnly = true)
    public ShiftResponse getShiftById(UUID id) {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_BY_ID, id);
        
        ShiftEntity shiftEntity = shiftRepository.findByShiftIdAndIsDeletedFalse(id);
        if (shiftEntity == null) {
            log.warn(ShiftConstants.LOG_ERR_SHIFT_NOT_FOUND);
            throw new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_SHIFT_NOT_FOUND);
        }

        // Force initialization of lazy-loaded appointment relationships
        if (shiftEntity.getAppointment() != null) {
            initializeAppointmentRelations(shiftEntity.getAppointment());
        }

        return shiftMapper.toResponse(shiftEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShiftResponse> searchShift(String keyword, Pageable pageable) {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_LIST);
        
        Page<ShiftEntity> shiftPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            shiftPage = shiftRepository.findByIsDeletedFalse(pageable);
        } else {
            shiftPage = shiftRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }

        // Force initialization of lazy-loaded relationships within transaction
        shiftPage.getContent().forEach(shift -> {
            if (shift.getAppointment() != null) {
                initializeAppointmentRelations(shift.getAppointment());
            }
        });

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
    @Transactional(readOnly = true)
    public PageResponse<ShiftResponse> searchShiftWithFilters(String keyword, String status, String shiftType,
                                                              String fromDate, String toDate, Pageable pageable) {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_LIST);
        
        Page<ShiftEntity> shiftPage = shiftRepository.findShiftsWithFilters(
                keyword, status, shiftType, fromDate, toDate, pageable);

        // Force initialization of lazy-loaded relationships within transaction
        shiftPage.getContent().forEach(shift -> {
            if (shift.getAppointment() != null) {
                initializeAppointmentRelations(shift.getAppointment());
            }
        });

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
    @Transactional(readOnly = true)
    public PageResponse<ShiftResponse> getShiftsByAppointmentId(UUID appointmentId, Pageable pageable) {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_LIST_BY_APPOINTMENT_ID, appointmentId);
        
        Page<ShiftEntity> shiftPage = shiftRepository.findByAppointmentId(appointmentId, pageable);

        // Force initialization of lazy-loaded relationships within transaction
        shiftPage.getContent().forEach(shift -> {
            if (shift.getAppointment() != null) {
                initializeAppointmentRelations(shift.getAppointment());
            }
        });

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
    @Transactional(readOnly = true)
    public PageResponse<ShiftResponse> searchShiftForTechnician(UUID technicianId, String keyword, Pageable pageable) {
        log.info(ShiftConstants.LOG_INFO_SHOWING_SHIFT_LIST_FOR_TECHNICIAN, technicianId);
        
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

        // Force initialization of lazy-loaded relationships within transaction
        shiftPage.getContent().forEach(shift -> {
            if (shift.getAppointment() != null) {
                initializeAppointmentRelations(shift.getAppointment());
            }
        });

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
            // Validation: Bắt buộc phải có nhân viên và kỹ thuật viên
            if (creationShiftRequest.getStaffId() == null) {
                log.warn(ShiftConstants.LOG_ERR_STAFF_REQUIRED);
                throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_STAFF_REQUIRED);
            }
            
            if (creationShiftRequest.getTechnicianIds() == null || creationShiftRequest.getTechnicianIds().isEmpty()) {
                log.warn(ShiftConstants.LOG_ERR_TECHNICIAN_REQUIRED);
                throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_TECHNICIAN_REQUIRED);
            }
            
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
            
            // Validation: Sau khi update, shift phải có nhân viên và kỹ thuật viên
            // Chỉ kiểm tra nếu có cập nhật staffId hoặc technicianIds trong request
            if (updationShiftRequest.getStaffId() != null || updationShiftRequest.getTechnicianIds() != null) {
                // Nếu update staffId, kiểm tra không null sau khi update
                if (updationShiftRequest.getStaffId() != null && shiftEntity.getStaff() == null) {
                    log.warn(ShiftConstants.LOG_ERR_STAFF_REQUIRED);
                    throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_STAFF_REQUIRED);
                }
                
                // Nếu update technicianIds, kiểm tra không empty sau khi update
                if (updationShiftRequest.getTechnicianIds() != null && 
                    (shiftEntity.getTechnicians() == null || shiftEntity.getTechnicians().isEmpty())) {
                    log.warn(ShiftConstants.LOG_ERR_TECHNICIAN_REQUIRED);
                    throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_TECHNICIAN_REQUIRED);
                }
            }
            
            // Đảm bảo shift luôn có staff và technicians sau khi update
            // (Kiểm tra nếu shift hiện tại không có staff/technicians sau khi update)
            if (shiftEntity.getStaff() == null) {
                log.warn(ShiftConstants.LOG_ERR_STAFF_REQUIRED);
                throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_STAFF_REQUIRED);
            }
            
            if (shiftEntity.getTechnicians() == null || shiftEntity.getTechnicians().isEmpty()) {
                log.warn(ShiftConstants.LOG_ERR_TECHNICIAN_REQUIRED);
                throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_TECHNICIAN_REQUIRED);
            }
            
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
            
            // Validation: Bắt buộc phải có nhân viên và kỹ thuật viên
            if (request.getStaffId() == null) {
                log.warn(ShiftConstants.LOG_ERR_STAFF_REQUIRED);
                throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_STAFF_REQUIRED);
            }
            
            if (request.getTechnicianIds() == null || request.getTechnicianIds().isEmpty()) {
                log.warn(ShiftConstants.LOG_ERR_TECHNICIAN_REQUIRED);
                throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_TECHNICIAN_REQUIRED);
            }
            
            UserEntity assignee = findUserEntity(request.getAssigneeId(), "Người phụ trách không tồn tại");
            UserEntity staff = findUserEntity(request.getStaffId(), "Nhân viên không tồn tại");
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
            searchBuilder.append(shiftEntity.getAppointment().getAppointmentId()).append(" ");
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
    
    @Override
    @Transactional
    public void updateShiftStatus(UUID id, String status) {
        ShiftEntity shiftEntity = shiftRepository.findByShiftIdAndIsDeletedFalse(id);
        if (shiftEntity == null) {
            log.warn(ShiftConstants.LOG_ERR_SHIFT_NOT_FOUND);
            throw new ResourceNotFoundException(ShiftConstants.MESSAGE_ERR_SHIFT_NOT_FOUND);
        }
        
        ShiftStatusEnum currentStatus = shiftEntity.getStatus();
        ShiftStatusEnum newStatus = isValidShiftStatus(status);
        
        // Không cho phép chỉnh sửa nếu đã COMPLETED hoặc CANCELLED
        if (currentStatus == ShiftStatusEnum.COMPLETED || currentStatus == ShiftStatusEnum.CANCELLED) {
            log.warn(ShiftConstants.LOG_WARN_CANNOT_UPDATE_SHIFT_COMPLETED_OR_CANCELLED, currentStatus);
            throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_CANNOT_UPDATE_SHIFT_COMPLETED_OR_CANCELLED);
        }
        
        // Chỉ cho phép chuyển sang IN_PROGRESS khi đang ở SCHEDULED
        if (newStatus == ShiftStatusEnum.IN_PROGRESS) {
            if (currentStatus != ShiftStatusEnum.SCHEDULED) {
                log.warn(ShiftConstants.LOG_WARN_CANNOT_TRANSITION_TO_IN_PROGRESS, currentStatus);
                throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_CAN_ONLY_START_FROM_SCHEDULED);
            }
            
            // ✅ Khi shift chuyển sang IN_PROGRESS → tự động chuyển appointment sang IN_PROGRESS (nếu có)
            // → AppointmentServiceImpl sẽ tự động tạo Maintenance Management và gửi email
            if (shiftEntity.getAppointment() != null) {
                AppointmentEntity appointment = shiftEntity.getAppointment();
                // Chỉ chuyển appointment sang IN_PROGRESS nếu đang ở CONFIRMED
                // (Logic trong AppointmentServiceImpl.updateAppointmentStatus sẽ validate)
                if (appointment.getStatus() != com.fpt.evcare.enums.AppointmentStatusEnum.IN_PROGRESS) {
                    try {
                        appointmentService.updateAppointmentStatus(appointment.getAppointmentId(), "IN_PROGRESS");
                        log.info(ShiftConstants.LOG_INFO_AUTO_UPDATED_APPOINTMENT_TO_IN_PROGRESS, 
                                appointment.getAppointmentId(), id);
                    } catch (Exception e) {
                        log.warn(ShiftConstants.LOG_WARN_FAILED_AUTO_UPDATE_APPOINTMENT, e.getMessage());
                        // Không throw exception để không block việc update shift status
                        // Có thể appointment chưa đủ điều kiện (chưa CONFIRMED hoặc thiếu assignee/technicians)
                    }
                }
            }
        }
        
        // Không cho phép quay ngược từ IN_PROGRESS
        if (currentStatus == ShiftStatusEnum.IN_PROGRESS && 
            (newStatus == ShiftStatusEnum.PENDING_ASSIGNMENT || newStatus == ShiftStatusEnum.LATE_ASSIGNMENT || newStatus == ShiftStatusEnum.SCHEDULED)) {
            log.warn(ShiftConstants.LOG_WARN_CANNOT_TRANSITION_BACKWARD, newStatus);
            throw new EntityValidationException(ShiftConstants.MESSAGE_ERR_CANNOT_TRANSITION_BACKWARD);
        }
        
        // Cập nhật trạng thái mới
        shiftEntity.setStatus(newStatus);
        shiftEntity.setSearch(buildSearchString(shiftEntity));
        shiftRepository.save(shiftEntity);
        
        log.info(ShiftConstants.LOG_INFO_SHIFT_STATUS_UPDATED, id, currentStatus, newStatus);
    }
    
    private ShiftStatusEnum isValidShiftStatus(String statusEnum) {
        try {
            return ShiftStatusEnum.valueOf(statusEnum.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.warn(ShiftConstants.LOG_WARN_INVALID_SHIFT_STATUS, statusEnum);
            throw new EntityValidationException(String.format(ShiftConstants.MESSAGE_ERR_INVALID_SHIFT_STATUS, statusEnum));
        }
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
}



