package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.appointment.CreationAppointmentRequest;
import com.fpt.evcare.dto.request.appointment.UpdationAppointmentRequest;
import com.fpt.evcare.dto.response.AppointmentResponse;
import com.fpt.evcare.entity.AppointmentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "appointmentId", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "serviceTypeEntities", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "serviceMode", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "quotePrice", ignore = true)
    @Mapping(target = "vehicleTypeEntity", ignore = true)
    AppointmentEntity toEntity(CreationAppointmentRequest creationAppointmentRequest);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "technicianResponses", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "serviceTypeResponses", ignore = true)
    @Mapping(target = "quotePrice", ignore = true)
    @Mapping(target = "vehicleTypeResponse", ignore = true)
    AppointmentResponse toResponse(AppointmentEntity appointmentEntity);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "serviceTypeEntities", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "serviceMode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "quotePrice", ignore = true)
    @Mapping(target = "vehicleTypeEntity", ignore = true)
    void toUpdate(@MappingTarget AppointmentEntity appointmentEntity, UpdationAppointmentRequest updationAppointmentRequest);
}
