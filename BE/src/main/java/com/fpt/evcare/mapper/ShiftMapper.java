package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.shift.CreationShiftRequest;
import com.fpt.evcare.dto.request.shift.UpdationShiftRequest;
import com.fpt.evcare.dto.response.AppointmentResponse;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.dto.response.ShiftResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.dto.response.VehicleTypeResponse;
import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.entity.ShiftEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.repository.UserRepository;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {AppointmentMapper.class, UserMapper.class})
public abstract class ShiftMapper {

    @Autowired
    protected UserRepository userRepository;
    
    @Autowired
    protected AppointmentMapper appointmentMapper;

    @Mapping(target = "shiftId", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "staff", source = "staffId", qualifiedByName = "mapUser")
    @Mapping(target = "technicians", source = "technicianIds", qualifiedByName = "mapUsers")
    @Mapping(target = "assignee", source = "assigneeId", qualifiedByName = "mapUser")
    public abstract ShiftEntity toEntity(CreationShiftRequest creationShiftRequest);

    @Mapping(source = "appointment", target = "appointment", qualifiedByName = "mapAppointment")
    public abstract ShiftResponse toResponse(ShiftEntity shiftEntity);
    
    @Named("mapAppointment")
    protected AppointmentResponse mapAppointment(AppointmentEntity appointmentEntity) {
        if (appointmentEntity == null) {
            return null;
        }
        

        AppointmentResponse appointmentResponse = appointmentMapper.toResponse(appointmentEntity);
        UserEntity customer = appointmentEntity.getCustomer();
        if (customer != null) {
            UserResponse customerResponse = new UserResponse();
            customerResponse.setUserId(customer.getUserId());
            customerResponse.setUsername(customer.getUsername());
            customerResponse.setFullName(customer.getFullName());
            customerResponse.setEmail(customer.getEmail());
            appointmentResponse.setCustomer(customerResponse);
        }

        if (appointmentEntity.getTechnicianEntities() != null) {
            List<UserResponse> technicianResponses = new ArrayList<>();
            appointmentEntity.getTechnicianEntities().forEach(technicianEntity -> {
                UserResponse techResponse = mapUserEntityToUserResponse(technicianEntity);
                if (techResponse != null) {
                    technicianResponses.add(techResponse);
                }
            });
            appointmentResponse.setTechnicianResponses(technicianResponses);
        }
        
        UserEntity assignee = appointmentEntity.getAssignee();
        appointmentResponse.setAssignee(mapUserEntityToUserResponse(assignee));
        
        if (appointmentEntity.getServiceTypeEntities() != null && !appointmentEntity.getServiceTypeEntities().isEmpty()) {
            List<ServiceTypeResponse> serviceTypeResponses = appointmentEntity.getServiceTypeEntities().stream()
                .filter(st -> !st.getIsDeleted()) 
                .map(this::mapServiceTypeToResponse)
                .collect(Collectors.toList());
            appointmentResponse.setServiceTypeResponses(serviceTypeResponses);
        } else {
            appointmentResponse.setServiceTypeResponses(Collections.emptyList());
        }
        
        if (appointmentEntity.getVehicleTypeEntity() != null) {
            VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
            vehicleTypeResponse.setVehicleTypeId(appointmentEntity.getVehicleTypeEntity().getVehicleTypeId());
            vehicleTypeResponse.setVehicleTypeName(appointmentEntity.getVehicleTypeEntity().getVehicleTypeName());
            vehicleTypeResponse.setBatteryCapacity(appointmentEntity.getVehicleTypeEntity().getBatteryCapacity());
            vehicleTypeResponse.setMaintenanceIntervalKm(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalKm());
            vehicleTypeResponse.setMaintenanceIntervalMonths(appointmentEntity.getVehicleTypeEntity().getMaintenanceIntervalMonths());
            vehicleTypeResponse.setManufacturer(appointmentEntity.getVehicleTypeEntity().getManufacturer());
            vehicleTypeResponse.setModelYear(appointmentEntity.getVehicleTypeEntity().getModelYear());
            appointmentResponse.setVehicleTypeResponse(vehicleTypeResponse);
        }
        
        if (appointmentResponse.getServiceTypeResponses() != null && !appointmentResponse.getServiceTypeResponses().isEmpty()) {
            appointmentResponse.setQuotePrice(appointmentEntity.getQuotePrice());
        } else {
            appointmentResponse.setQuotePrice(BigDecimal.ZERO);
        }
        
        return appointmentResponse;
    }
    

    private ServiceTypeResponse mapServiceTypeToResponse(ServiceTypeEntity serviceType) {
        ServiceTypeResponse response = new ServiceTypeResponse();
        response.setServiceTypeId(serviceType.getServiceTypeId());
        response.setServiceName(serviceType.getServiceName());
        response.setDescription(serviceType.getDescription());
        response.setParentId(serviceType.getParentId());
        response.setIsActive(serviceType.getIsActive());
        response.setIsDeleted(serviceType.getIsDeleted());
        response.setCreatedAt(serviceType.getCreatedAt());
        response.setUpdatedAt(serviceType.getUpdatedAt());
        response.setCreatedBy(serviceType.getCreatedBy());
        response.setUpdatedBy(serviceType.getUpdatedBy());
        return response;
    }
    

    private UserResponse mapUserEntityToUserResponse(UserEntity userEntity) {
        if (userEntity == null) {
            return null;
        }
        UserResponse userResponse = new UserResponse();
        userResponse.setUserId(userEntity.getUserId());
        userResponse.setUsername(userEntity.getUsername());
        userResponse.setFullName(userEntity.getFullName());
        userResponse.setEmail(userEntity.getEmail());
        // phoneNumber and role are set through other fields if available
        return userResponse;
    }

    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "staff", source = "staffId", qualifiedByName = "mapUser")
    @Mapping(target = "technicians", source = "technicianIds", qualifiedByName = "mapUsers")
    @Mapping(target = "assignee", source = "assigneeId", qualifiedByName = "mapUser")
    public abstract void toUpdate(@MappingTarget ShiftEntity shiftEntity, UpdationShiftRequest updationShiftRequest);

    @Named("mapUser")
    protected UserEntity mapUser(UUID userId) {
        if (userId == null) {
            return null;
        }
        UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(userId);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        return user;
    }

    @Named("mapUsers")
    protected List<UserEntity> mapUsers(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<UserEntity> users = new ArrayList<>();
        for (UUID userId : userIds) {
            UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(userId);
            if (user == null) {
                throw new ResourceNotFoundException("User not found with ID: " + userId);
            }
            users.add(user);
        }
        return users;
    }
}

