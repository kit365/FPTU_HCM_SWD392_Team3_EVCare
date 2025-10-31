package com.fpt.evcare.service;


import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationCustomerAppointmentRequest;
import com.fpt.evcare.dto.response.AppointmentResponse;
import com.fpt.evcare.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    AppointmentResponse getAppointmentById(UUID id);
    PageResponse<AppointmentResponse> getAllAppointmentsByEmailOrPhoneForCustomer(String keyword, Pageable pageable);

    PageResponse<AppointmentResponse> getAllAppointmentsByEmailOrPhoneForGuest(String keyword, Pageable pageable);
    List<String> getAllServiceMode();
    String getCancelStatus();
    String getInProgressStatus();
    PageResponse<AppointmentResponse> getAppointmentsByUserId(UUID userId, String keyword, Pageable pageable);
    PageResponse<AppointmentResponse> searchAppointment(String keyword, Pageable pageable);
    PageResponse<AppointmentResponse> searchAppointmentWithFilters(String keyword, String status, String serviceMode, 
                                                                    String fromDate, String toDate, Pageable pageable);

    boolean addAppointment(CreationAppointmentRequest creationAppointmentRequest);
    boolean updateAppointmentForCustomer(UUID id, UpdationCustomerAppointmentRequest updationCustomerAppointmentRequest);
    boolean updateAppointmentForStaff(UUID id, UpdationAppointmentRequest updationAppointmentRequest);
    void updateAppointmentStatus(UUID id, String status);
}
