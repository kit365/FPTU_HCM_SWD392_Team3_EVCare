package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.vehicle_part_category.CreationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.request.vehicle_part_category.UpdationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehiclePartCategoryResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface VehiclePartCategoryService {
    VehiclePartCategoryResponse getVehiclePartCategoryById(UUID id);
    List<VehiclePartCategoryResponse> getvehiclePartCategoryResponseList();
    PageResponse<VehiclePartCategoryResponse> seacrchVehiclePartCategory
    (String keyword, Pageable pageable);
    boolean createVehiclePartCategory(CreationVehiclePartCategoryRequest creationVehiclePartCategoryRequest);
    boolean updateVehiclePartCategory(UUID id, UpdationVehiclePartCategoryRequest updationVehiclePartCategoryRequest);
    boolean deleteVehiclePartCategory(UUID id);
    boolean restoreVehiclePartCategory(UUID id);
}
