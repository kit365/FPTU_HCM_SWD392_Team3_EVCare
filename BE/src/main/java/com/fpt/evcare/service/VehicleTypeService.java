package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.vehicle_type.CreationVehicleTypeRequest;
import com.fpt.evcare.dto.request.vehicle_type.UpdationVehicleTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehicleTypeResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface VehicleTypeService {
    VehicleTypeResponse getVehicleTypeById(UUID uuid);
    PageResponse<VehicleTypeResponse> searchVehicleTypes(String keyword, Pageable pageable);
    List<VehicleTypeResponse> getVehicleTypeNameListForServiceType();
    List<VehicleTypeResponse> getVehicleTypeNameList();
    boolean addVehicleType(CreationVehicleTypeRequest creationVehicleTypeRequest);
    boolean updateVehicleType(UUID id, UpdationVehicleTypeRequest updationVehicleTypeRequest);
    boolean deleteVehicleType(UUID id);
    boolean restoreVehicleType(UUID id);

}
