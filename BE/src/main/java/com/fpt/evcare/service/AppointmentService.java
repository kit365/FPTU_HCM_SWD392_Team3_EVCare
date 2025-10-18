package com.fpt.evcare.service;


import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.response.AppointmentResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.entity.ServiceTypeEntity;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    AppointmentResponse getAppointmentById(UUID id);
    List<String> getAllServiceMode();
    List<String> getAllStatus();
    PageResponse<AppointmentResponse> getAppointmentsByUserId(UUID userId, String keyword, Pageable pageable);
    PageResponse<AppointmentResponse> searchAppointment(String keyword, Pageable pageable);
    BigDecimal calculateQuotePrice(List<ServiceTypeEntity> serviceTypeEntityList);
    boolean addAppointment(CreationAppointmentRequest creationAppointmentRequest);
    boolean updateAppointment(UUID id, UpdationAppointmentRequest updationAppointmentRequest);
    boolean updateAppointmentStatus(UUID id, String status);
    boolean deleteAppointment(UUID id);
    boolean restoreAppointment(UUID id);
}
