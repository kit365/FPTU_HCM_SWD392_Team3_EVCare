package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.vehicle.CreationVehicleRequest;
import com.fpt.evcare.dto.request.vehicle.UpdationVehicleRequest;
import com.fpt.evcare.dto.response.VehicleResponse;
import com.fpt.evcare.entity.VehicleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VehicleMapper {
    VehicleEntity toEntity(CreationVehicleRequest request);
    VehicleResponse toVehicleResponse(VehicleEntity vehicleEntity);
    void updateVehicleFromDto(UpdationVehicleRequest request, @MappingTarget VehicleEntity vehicleEntity);
}
