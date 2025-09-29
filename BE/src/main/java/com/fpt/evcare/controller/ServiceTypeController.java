package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.service.ServiceTypeService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
    @Operation(summary = "Lấy 1 dịch vụ", description = "Người dùng lấy ra thông tin cụ thể cho 1 dịch vụ theo id")

    public ResponseEntity<ApiResponse<ServiceTypeResponse>> getServiceType(@PathVariable UUID id) {
        ServiceTypeResponse response = serviceTypeService.getServiceTypeById(id);
        return ResponseEntity.ok(ApiResponse.<ServiceTypeResponse>builder()
                .success(true)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE)
            .data(response)
                .build()
        );
    }

    @GetMapping(ServiceTypeConstants.SERVICE_TYPE_LIST)
    @Operation(summary = "Lấy ra danh sách dịch vụ", description = "Người dùng lấy ra thông tin tất cả dịch vụ, có cấu trúc cây")
    public ResponseEntity<ApiResponse<List<ServiceTypeResponse>>> getAllServiceTypes() {
        List<ServiceTypeResponse> responses = serviceTypeService.getServiceTree();
        return ResponseEntity.ok(ApiResponse.<List<ServiceTypeResponse>>builder()
                .success(true)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_SHOWING_SERVICE_TYPE)
                .data(responses)
                .build()
        );
    }

    @PostMapping(ServiceTypeConstants.SERVICE_TYPE_CREATION)
    @Operation(summary = "Tạo 1 dịch vụ", description = "Người dùng tạo ra thông tin cụ thể cho 1 dịch vụ mới")
    public ResponseEntity<ApiResponse<String>> createServiceType(@Valid @RequestBody CreationServiceTypeRequest request) {
        boolean result = serviceTypeService.createServiceType(request);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_CREATING_SERVICE_TYPE)
                .build()
        );
    }

    @PatchMapping(ServiceTypeConstants.SERVICE_TYPE_UPDATE)
    @Operation(summary = "Cập nhật 1 dịch vụ", description = "Người dùng cập nhật thông tin cụ thể cho 1 dịch vụ theo id")
    public ResponseEntity<ApiResponse<String>> updateServiceType(@PathVariable UUID id, @Valid @RequestBody UpdationServiceTypeRequest request) {
        boolean result = serviceTypeService.updateServiceType(id, request);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_UPDATING_SERVICE_TYPE)
                .build()
        );
    }

    @DeleteMapping(ServiceTypeConstants.SERVICE_TYPE_DELETE)
    @Operation(summary = "Xóa 1 dịch vụ", description = "Người dùng xóa mềm 1 dịch vụ theo id")
    public ResponseEntity<ApiResponse<String>> deleteServiceType(@PathVariable UUID id) {
        boolean result = serviceTypeService.deleteServiceType(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(result)
                .message(ServiceTypeConstants.MESSAGE_SUCCESS_DELETING_SERVICE_TYPE)
                .build()
        );
    }
}
