package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ServiceTypeService {
    ServiceTypeResponse getServiceTypeById(UUID id);
    List<ServiceTypeResponse> getParentServiceListByVehicleTypeId(UUID vehicleTypeId);
    List<ServiceTypeResponse> getChildrenServiceByParentIdAndVehicleTypeId(UUID parentId, UUID vehicleTypeId);
    List<ServiceTypeResponse> getAllServiceTypesByVehicleTypeForAppointment(UUID vehicleTypeId);
    PageResponse<ServiceTypeResponse> searchServiceType(String search, UUID vehicleTypeId, Boolean isActive, Pageable pageable);
    boolean createServiceType(CreationServiceTypeRequest creationServiceTypeRequest);
    boolean updateServiceType(UUID id, UpdationServiceTypeRequest updationServiceTypeRequest);
    boolean deleteServiceType(UUID id);
    boolean restoreServiceType(UUID id);

}
