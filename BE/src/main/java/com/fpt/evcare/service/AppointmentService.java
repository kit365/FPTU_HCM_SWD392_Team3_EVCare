package com.fpt.evcare.service;


import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.response.AppointmentResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AppointmentService {
    AppointmentResponse getAppointmentById(UUID id);
    PageResponse<AppointmentResponse> getAppointmentsByUserId(UUID userId, Pageable pageable);
    PageResponse<AppointmentResponse> searchAppointment(String keyword, Pageable pageable);
    boolean addAppointment(CreationAppointmentRequest creationAppointmentRequest);
    boolean updateAppointment(UUID id, UpdationAppointmentRequest updationAppointmentRequest);
    boolean updateAppointmentStatus(UUID id, AppointmentStatusEnum status);
    boolean deleteAppointment(UUID id);
    boolean restoreAppointment(UUID id);
}
