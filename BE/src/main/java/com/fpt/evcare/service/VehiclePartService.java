package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.vehicle_part.CreationVehiclePartRequest;
import com.fpt.evcare.dto.request.vehicle_part.UpdationVehiclePartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehiclePartResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface VehiclePartService {
    VehiclePartResponse getVehiclePart(UUID vehiclePartId);
    List<String> getAllVehiclePartStatuses();
    List<VehiclePartResponse> getAllVehiclePartsByVehicleTypeId(UUID vehicleTypeId);
    PageResponse<VehiclePartResponse> searchVehiclePart(String search, Pageable pageable);
    PageResponse<VehiclePartResponse> searchVehiclePartWithFilters(String keyword, String vehicleTypeId, 
                                                                   String categoryId, String status, 
                                                                   Boolean minStock, Pageable pageable);
    void subtractQuantity(UUID vehiclePartId, Integer quantity);
    void restoreQuantity(UUID vehiclePartId, Integer quantity);
    boolean addVehiclePart(CreationVehiclePartRequest creationVehiclePartRequest);
    boolean deleteVehiclePart(UUID id);
    boolean updateVehiclePart(UUID id, UpdationVehiclePartRequest updationVehiclePartRequest);
    boolean restoreVehiclePart(UUID uuid);

}
