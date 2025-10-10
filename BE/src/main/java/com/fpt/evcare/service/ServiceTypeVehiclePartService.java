package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.service_type_vehicle_part.CreationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.request.service_type_vehicle_part.UpdationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.response.ServiceTypeVehiclePartResponse;

import java.util.List;
import java.util.UUID;

public interface ServiceTypeVehiclePartService {
    List<ServiceTypeVehiclePartResponse> getVehiclePartByServiceTypeId(UUID id);
    boolean createServiceTypeVehiclePart(CreationServiceTypeVehiclePartRequest creationServiceTypeVehiclePartRequest);
    boolean updateServiceTypeVehiclePart(UUID id, UpdationServiceTypeVehiclePartRequest updationServiceTypeVehiclePartRequest);
    boolean deleteServiceTypeVehiclePart(UUID id);
    void deleteServiceTypeVehiclePartByServiceTypeId(UUID id);

}
