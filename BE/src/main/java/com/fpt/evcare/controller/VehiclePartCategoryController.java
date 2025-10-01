package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.VehiclePartCategoryConstant;
import com.fpt.evcare.dto.request.vehicle_part_category.CreationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.request.vehicle_part_category.UpdationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.response.VehiclePartCategoryResponse;
import com.fpt.evcare.service.VehiclePartCategoryService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@Slf4j
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(VehiclePartCategoryConstant.BASE_URL)
public class VehiclePartCategoryController {

    VehiclePartCategoryService vehiclePartCategoryService;

    @GetMapping(VehiclePartCategoryConstant.VEHICLE_PART_CATEGORY)
    public ResponseEntity<ApiResponse<VehiclePartCategoryResponse>> getVehiclePartCategoryById(@PathVariable UUID id) {
        VehiclePartCategoryResponse vehiclePartCategoryResponse = vehiclePartCategoryService.getVehiclePartCategoryById(id);

        return ResponseEntity
                .ok(ApiResponse.<VehiclePartCategoryResponse>builder()
                        .success(true)
                        .message(VehiclePartCategoryConstant.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY)
                        .data(vehiclePartCategoryResponse)
                        .build()
                );
    }

    @GetMapping(VehiclePartCategoryConstant.VEHICLE_PART_CATEGORY_LIST)
    public ResponseEntity<ApiResponse<List<VehiclePartCategoryResponse>>> getAllVehiclePartCategory() {
        List<VehiclePartCategoryResponse> vehiclePartCategoryResponse = vehiclePartCategoryService.getAllVehiclePartCategory();

        return ResponseEntity
                .ok(ApiResponse.<List<VehiclePartCategoryResponse>>builder()
                        .success(true)
                        .message(VehiclePartCategoryConstant.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY_LIST)
                        .data(vehiclePartCategoryResponse)
                        .build()
                );
    }

    @GetMapping(VehiclePartCategoryConstant.VEHICLE_PART_CATEGORY_SEARCH)
    public ResponseEntity<ApiResponse<List<VehiclePartCategoryResponse>>> searchVehiclePartCategory(@RequestParam(name = "keyword") String keyword) {
        List<VehiclePartCategoryResponse> vehiclePartCategoryResponse = vehiclePartCategoryService.seacrchVehiclePartCategory(keyword);
        return ResponseEntity
                .ok(ApiResponse.<List<VehiclePartCategoryResponse>>builder()
                        .success(true)
                        .message(VehiclePartCategoryConstant.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY_LIST)
                        .data(vehiclePartCategoryResponse)
                        .build()
                );
    }

    @PostMapping(VehiclePartCategoryConstant.VEHICLE_PART_CATEGORY_CREATION)
    public ResponseEntity<ApiResponse<String>> createVehiclePartCategory(@Valid @RequestBody CreationVehiclePartCategoryRequest creationVehiclePartCategoryRequest) {
         boolean result = vehiclePartCategoryService.createVehiclePartCategory(creationVehiclePartCategoryRequest);

          return ResponseEntity
                .ok(ApiResponse.<String>builder()
                          .success(result)
                          .message(VehiclePartCategoryConstant.MESSAGE_SUCCESS_CREATING_VEHICLE_PART_CATEGORY )
                          .build()
                );
    }

    @PatchMapping(VehiclePartCategoryConstant.VEHICLE_PART_CATEGORY_UPDATE)
    public ResponseEntity<ApiResponse<String>> updateVehiclePartCategory(@PathVariable UUID id, @Valid @RequestBody UpdationVehiclePartCategoryRequest updationVehiclePartCategoryRequest) {
        boolean result = vehiclePartCategoryService.updateVehiclePartCategory(id, updationVehiclePartCategoryRequest);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(VehiclePartCategoryConstant.MESSAGE_SUCCESS_UPDATING_VEHICLE_PART_CATEGORY)
                        .build()
                );
    }

    @DeleteMapping(VehiclePartCategoryConstant.VEHICLE_PART_CATEGORY_DELETE)
    public ResponseEntity<ApiResponse<String>> deleteVehiclePartCategory(@PathVariable UUID id) {
        boolean result = vehiclePartCategoryService.deleteVehiclePartCategory(id);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(VehiclePartCategoryConstant.MESSAGE_SUCCESS_DELETING_VEHICLE_PART_CATEGORY)
                        .build()
                );
    }

    @PatchMapping(VehiclePartCategoryConstant.VEHICLE_PART_CATEGORY_RESTORING)
    public ResponseEntity<ApiResponse<String>> restoreVehiclePartCategory(@PathVariable UUID id) {
        boolean result = vehiclePartCategoryService.restoreVehiclePartCategory(id);
        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(VehiclePartCategoryConstant.MESSAGE_SUCCESS_SHOWING_VEHICLE_PART_CATEGORY)
                        .build()
                );
    }
}
