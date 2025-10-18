package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.PaginationConstants;
import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.service.ServiceTypeService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(ServiceTypeConstants.BASE_URL)
public class ServiceTypeController {

    ServiceTypeService serviceTypeService;

    @GetMapping(ServiceTypeConstants.SERVICE_TYPE)
    @Operation(summary = "Lấy 1 dịch vụ", description = "Lấy ra thông tin cụ thể cho 1 dịch vụ theo id")
    public ResponseEntity<ApiResponse<ServiceTypeResponse>> getServiceType(@PathVariable UUID id) {
        ServiceTypeResponse response = serviceTypeService.getServiceTypeById(id);
        return ResponseEntity.ok(ApiResponse.<ServiceTypeResponse>builder()
                .success(true)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE)
                .data(response)
                .build()
        );
    }

    @GetMapping(ServiceTypeConstants.SERVICE_TYPE_LIST_FOR_APPOINTMENT)
    @Operation(summary = "Lấy ra danh sách dịch vụ theo loại xe cho cuộc hẹn", description = "Lấy ra danh sách dịch vụ theo loại xe cho cuộc hẹn")
    public ResponseEntity<ApiResponse<List<ServiceTypeResponse>>> getListServiceTypeByVehicleTypeIdForAppointment(@PathVariable(name = "serviceTypeId") UUID id) {
        List<ServiceTypeResponse> response = serviceTypeService.getAllServiceTypesByVehicleTypeForAppointment(id);
        return ResponseEntity.ok(ApiResponse.< List<ServiceTypeResponse>>builder()
                .success(true)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE)
                .data(response)
                .build()
        );
    }

    @GetMapping(ServiceTypeConstants.SERVICE_TYPE_LIST)
    @Operation(summary = "Lấy ra danh sách dịch vụ theo id loại xe", description = "Lấy ra thông tin tất cả dịch vụ theo id loại xe, có cấu trúc cây")
    public ResponseEntity<ApiResponse<PageResponse<ServiceTypeResponse>>> getAllServiceTypes(
            @RequestParam(name = PaginationConstants.PAGE_KEY, defaultValue = ServiceTypeConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(name = PaginationConstants.PAGE_SIZE_KEY, defaultValue = ServiceTypeConstants.DEFAULT_PAGE_SIZE) int pageSize,
            @RequestParam(name = PaginationConstants.KEYWORD_KEY, defaultValue = "", required = false) String keyword,
            @PathVariable(name = "vehicleTypeId") UUID vehicleTypeId) {
        Pageable pageable = PageRequest.of(page, pageSize);

        PageResponse<ServiceTypeResponse> responses = serviceTypeService.searchServiceType(keyword, vehicleTypeId, pageable);

        return ResponseEntity.ok(ApiResponse.<PageResponse<ServiceTypeResponse>>builder()
                .success(true)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE_LIST)
                .data(responses)
                .build()
        );
    }

    @PostMapping(ServiceTypeConstants.SERVICE_TYPE_CREATION)
    @Operation(summary = "Tạo 1 dịch vụ", description = "Tạo ra thông tin cụ thể cho 1 dịch vụ mới")
    public ResponseEntity<ApiResponse<String>> createServiceType(@Valid @RequestBody CreationServiceTypeRequest request) {
        boolean result = serviceTypeService.createServiceType(request);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_CREATING_SERVICE_TYPE)
                .build()
        );
    }

    @PatchMapping(ServiceTypeConstants.SERVICE_TYPE_UPDATE)
    @Operation(summary = "Cập nhật 1 dịch vụ", description = "Cập nhật thông tin cụ thể cho 1 dịch vụ theo id")
    public ResponseEntity<ApiResponse<String>> updateServiceType(@PathVariable UUID id, @Valid @RequestBody UpdationServiceTypeRequest request) {
        boolean result = serviceTypeService.updateServiceType(id, request);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_UPDATING_SERVICE_TYPE)
                .build()
        );
    }

    @DeleteMapping(ServiceTypeConstants.SERVICE_TYPE_DELETE)
    @Operation(summary = "Xóa 1 dịch vụ", description = "Xóa mềm 1 dịch vụ theo id")
    public ResponseEntity<ApiResponse<String>> deleteServiceType(@PathVariable UUID id) {
        boolean result = serviceTypeService.deleteServiceType(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_DELETING_SERVICE_TYPE)
                .build()
        );
    }

    @PatchMapping(ServiceTypeConstants.RESTORING_SERVICE_TYPE)
    @Operation(summary = "Khôi phục 1 dịch vụ", description = "Khôi phục 1 dịch vụ sau khi bị xóa")
    public ResponseEntity<ApiResponse<String>> restoreServiceType(@PathVariable UUID id) {
        boolean result = serviceTypeService.restoreServiceType(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_RESTORING_SERVICE_TYPE)
                .build()
        );
    }
}
