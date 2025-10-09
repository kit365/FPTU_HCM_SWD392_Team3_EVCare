package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.vehicle.CreationVehicleRequest;
import com.fpt.evcare.dto.request.vehicle.UpdationVehicleRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehicleResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface VehicleService {
    VehicleResponse getVehicleById(UUID vehicleId);
    PageResponse<VehicleResponse> searchVehicle(String keyword, Pageable pageable);
    VehicleResponse addVehicle(CreationVehicleRequest vehicleRequest);
    VehicleResponse updateVehicle(UUID vehicleId, UpdationVehicleRequest vehicleRequest);
    void deleteVehicle(UUID vehicleId);



}
