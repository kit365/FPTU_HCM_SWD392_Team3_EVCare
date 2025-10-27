package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.shift.AssignShiftRequest;
import com.fpt.evcare.dto.request.shift.CheckTechnicianAvailabilityRequest;
import com.fpt.evcare.dto.request.shift.CreationShiftRequest;
import com.fpt.evcare.dto.request.shift.UpdationShiftRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ShiftResponse;
import com.fpt.evcare.dto.response.TechnicianAvailabilityResponse;
import com.fpt.evcare.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ShiftService {
    
    ShiftResponse getShiftById(UUID id);
    
    List<String> getAllShiftTypes();
    
    List<String> getAllShiftStatuses();
    
    PageResponse<ShiftResponse> searchShift(String keyword, Pageable pageable);
    
    PageResponse<ShiftResponse> getShiftsByAppointmentId(UUID appointmentId, Pageable pageable);
    
    boolean addShift(CreationShiftRequest creationShiftRequest);
    
    boolean updateShift(UUID id, UpdationShiftRequest updationShiftRequest);
    
    boolean deleteShift(UUID id);
    
    boolean restoreShift(UUID id);
    
    boolean assignShift(UUID shiftId, AssignShiftRequest request);

    List<TechnicianAvailabilityResponse> checkTechnicianAvailability(
            CheckTechnicianAvailabilityRequest request);

    List<UserResponse> getAvailableTechnicians(
            LocalDateTime startTime,
            LocalDateTime endTime,
            UUID excludeShiftId);

    void updateShiftStatuses();
}



