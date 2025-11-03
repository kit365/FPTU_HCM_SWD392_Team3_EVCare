package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.WarrantyPackageConstants;
import com.fpt.evcare.dto.request.warranty_package.CreationWarrantyPackageRequest;
import com.fpt.evcare.dto.request.warranty_package.CreationWarrantyPackagePartRequest;
import com.fpt.evcare.dto.request.warranty_package.UpdationWarrantyPackageRequest;
import com.fpt.evcare.dto.request.warranty_package.UpdationWarrantyPackagePartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.WarrantyPackagePartResponse;
import com.fpt.evcare.dto.response.WarrantyPackageResponse;
import com.fpt.evcare.service.WarrantyPackageService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(WarrantyPackageConstants.BASE_URL)
public class WarrantyPackageController {

    WarrantyPackageService warrantyPackageService;

    @Operation(summary = "Lấy thông tin gói bảo hành theo ID", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @GetMapping(WarrantyPackageConstants.WARRANTY_PACKAGE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<WarrantyPackageResponse>> getWarrantyPackage(@PathVariable UUID id) {
        try {
            WarrantyPackageResponse response = warrantyPackageService.getWarrantyPackageById(id);
            return ResponseEntity.ok(ApiResponse.<WarrantyPackageResponse>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE)
                    .data(response)
                    .build()
            );
        } catch (Throwable t) {
            log.error("ERROR getting warranty package {}: {}", id, t.getClass().getName());
            log.error("ERROR message: {}", t.getMessage());
            if (t.getCause() != null) {
                log.error("ERROR cause: {}", t.getCause().getMessage());
            }
            log.error("ERROR stack trace: ", t);
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<WarrantyPackageResponse>builder()
                            .success(false)
                            .message("Không tìm thấy gói bảo hành: " + (t.getMessage() != null ? t.getMessage() : "Lỗi không xác định"))
                            .build()
                    );
        }
    }

    @Operation(summary = "Tìm kiếm gói bảo hành", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @GetMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<WarrantyPackageResponse>>> searchWarrantyPackages(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "isValid", required = false) Boolean isValid) {
        
        // Đảm bảo không bao giờ throw exception - luôn trả về response hợp lệ
        PageResponse<WarrantyPackageResponse> response;
        try {
            Pageable pageable = PageRequest.of(page, size);
            response = warrantyPackageService.searchWarrantyPackages(keyword, isValid, pageable);
            
            // Safety check: đảm bảo response không null
            if (response == null) {
                log.warn("Service returned null response, returning empty list");
                response = PageResponse.<WarrantyPackageResponse>builder()
                        .data(java.util.List.of())
                        .page(page)
                        .size(size)
                        .totalElements(0)
                        .totalPages(0)
                        .last(true)
                        .build();
            }
        } catch (Throwable t) { // Catch cả Error, không chỉ Exception
            // Log chi tiết để debug lỗi 500
            log.error("ERROR in searchWarrantyPackages controller: {}", t.getClass().getName());
            log.error("ERROR message: {}", t.getMessage());
            if (t.getCause() != null) {
                log.error("ERROR cause: {}", t.getCause().getMessage());
                log.error("ERROR cause class: {}", t.getCause().getClass().getName());
            }
            log.error("ERROR stack trace: ", t);
            // Trả về danh sách rỗng thay vì throw exception
            response = PageResponse.<WarrantyPackageResponse>builder()
                    .data(java.util.List.of())
                    .page(page)
                    .size(size)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }
        
        try {
            return ResponseEntity.ok(ApiResponse.<PageResponse<WarrantyPackageResponse>>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE_LIST)
                    .data(response)
                    .build()
            );
        } catch (Throwable t) {
            log.debug("Error building response entity: {}", t.getMessage());
            // Fallback: trả về empty response
            PageResponse<WarrantyPackageResponse> emptyResponse = PageResponse.<WarrantyPackageResponse>builder()
                    .data(java.util.List.of())
                    .page(page)
                    .size(size)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
            
            return ResponseEntity.ok(ApiResponse.<PageResponse<WarrantyPackageResponse>>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE_LIST)
                    .data(emptyResponse)
                    .build()
            );
        }
    }

    @Operation(summary = "Tạo gói bảo hành mới", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @PostMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_CREATION)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> createWarrantyPackage(@Valid @RequestBody CreationWarrantyPackageRequest request) {
        try {
            warrantyPackageService.createWarrantyPackage(request);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_CREATING_WARRANTY_PACKAGE)
                    .build()
            );
        } catch (Throwable t) {
            log.error("ERROR creating warranty package: {}", t.getClass().getName());
            log.error("ERROR message: {}", t.getMessage());
            if (t.getCause() != null) {
                log.error("ERROR cause: {}", t.getCause().getMessage());
            }
            log.error("ERROR stack trace: ", t);
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message(t.getMessage() != null ? t.getMessage() : "Không thể tạo gói bảo hành")
                            .build()
                    );
        }
    }

    @Operation(summary = "Cập nhật gói bảo hành", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @PatchMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_UPDATE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> updateWarrantyPackage(
            @PathVariable UUID id,
            @Valid @RequestBody UpdationWarrantyPackageRequest request) {
        try {
            warrantyPackageService.updateWarrantyPackage(id, request);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_UPDATING_WARRANTY_PACKAGE)
                    .build()
            );
        } catch (Throwable t) {
            log.error("ERROR updating warranty package {}: {}", id, t.getClass().getName());
            log.error("ERROR message: {}", t.getMessage());
            if (t.getCause() != null) {
                log.error("ERROR cause: {}", t.getCause().getMessage());
            }
            log.error("ERROR stack trace: ", t);
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message(t.getMessage() != null ? t.getMessage() : "Không thể cập nhật gói bảo hành")
                            .build()
                    );
        }
    }

    @Operation(summary = "Xóa gói bảo hành", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @DeleteMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_DELETE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> deleteWarrantyPackage(@PathVariable UUID id) {
        try {
            warrantyPackageService.deleteWarrantyPackage(id);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_DELETING_WARRANTY_PACKAGE)
                    .build()
            );
        } catch (Throwable t) {
            log.error("ERROR deleting warranty package {}: {}", id, t.getClass().getName());
            log.error("ERROR message: {}", t.getMessage());
            if (t.getCause() != null) {
                log.error("ERROR cause: {}", t.getCause().getMessage());
            }
            log.error("ERROR stack trace: ", t);
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message(t.getMessage() != null ? t.getMessage() : "Không thể xóa gói bảo hành")
                            .build()
                    );
        }
    }

    // ========== WarrantyPackagePart Endpoints ==========

    @Operation(summary = "Lấy thông tin phụ tùng bảo hành theo ID", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @GetMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_PART)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<WarrantyPackagePartResponse>> getWarrantyPackagePart(@PathVariable UUID id) {
        try {
            WarrantyPackagePartResponse response = warrantyPackageService.getWarrantyPackagePartById(id);
            return ResponseEntity.ok(ApiResponse.<WarrantyPackagePartResponse>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE_PART)
                    .data(response)
                    .build()
            );
        } catch (Throwable t) {
            log.debug("Error getting warranty package part {}: {}", id, t.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<WarrantyPackagePartResponse>builder()
                            .success(false)
                            .message("Không tìm thấy phụ tùng bảo hành")
                            .build()
                    );
        }
    }

    @Operation(summary = "Lấy danh sách phụ tùng bảo hành theo gói", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @GetMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_PART_LIST)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<WarrantyPackagePartResponse>>> getWarrantyPackageParts(
            @PathVariable UUID warrantyPackageId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            PageResponse<WarrantyPackagePartResponse> response = 
                    warrantyPackageService.getWarrantyPackagePartsByPackageId(warrantyPackageId, pageable);

            if (response == null) {
                response = PageResponse.<WarrantyPackagePartResponse>builder()
                        .data(java.util.List.of())
                        .page(page)
                        .size(size)
                        .totalElements(0)
                        .totalPages(0)
                        .last(true)
                        .build();
            }

            return ResponseEntity.ok(ApiResponse.<PageResponse<WarrantyPackagePartResponse>>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE_PART_LIST)
                    .data(response)
                    .build()
            );
        } catch (Throwable t) {
            log.debug("Error getting warranty package parts for package {}: {}", warrantyPackageId, t.getMessage());
            PageResponse<WarrantyPackagePartResponse> emptyResponse = PageResponse.<WarrantyPackagePartResponse>builder()
                    .data(java.util.List.of())
                    .page(page)
                    .size(size)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
            return ResponseEntity.ok(ApiResponse.<PageResponse<WarrantyPackagePartResponse>>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_SHOWING_WARRANTY_PACKAGE_PART_LIST)
                    .data(emptyResponse)
                    .build()
            );
        }
    }

    @Operation(summary = "Thêm phụ tùng vào gói bảo hành", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @PostMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_PART_CREATION)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> createWarrantyPackagePart(
            @PathVariable UUID warrantyPackageId,
            @Valid @RequestBody CreationWarrantyPackagePartRequest request) {
        try {
            warrantyPackageService.createWarrantyPackagePart(warrantyPackageId, request);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_CREATING_WARRANTY_PACKAGE_PART)
                    .build()
            );
        } catch (Throwable t) {
            log.debug("Error creating warranty package part: {}", t.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message(t.getMessage() != null ? t.getMessage() : "Không thể thêm phụ tùng vào gói bảo hành")
                            .build()
                    );
        }
    }

    @Operation(summary = "Cập nhật phụ tùng bảo hành", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @PatchMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_PART_UPDATE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> updateWarrantyPackagePart(
            @PathVariable UUID id,
            @Valid @RequestBody UpdationWarrantyPackagePartRequest request) {
        try {
            warrantyPackageService.updateWarrantyPackagePart(id, request);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_UPDATING_WARRANTY_PACKAGE_PART)
                    .build()
            );
        } catch (Throwable t) {
            log.debug("Error updating warranty package part {}: {}", id, t.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message(t.getMessage() != null ? t.getMessage() : "Không thể cập nhật phụ tùng bảo hành")
                            .build()
                    );
        }
    }

    @Operation(summary = "Xóa phụ tùng bảo hành", description = "👨‍💼 **Roles:** ADMIN, STAFF")
    @DeleteMapping(WarrantyPackageConstants.WARRANTY_PACKAGE_PART_DELETE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> deleteWarrantyPackagePart(@PathVariable UUID id) {
        try {
            warrantyPackageService.deleteWarrantyPackagePart(id);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message(WarrantyPackageConstants.MESSAGE_SUCCESS_DELETING_WARRANTY_PACKAGE_PART)
                    .build()
            );
        } catch (Throwable t) {
            log.debug("Error deleting warranty package part {}: {}", id, t.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message(t.getMessage() != null ? t.getMessage() : "Không thể xóa phụ tùng bảo hành")
                            .build()
                    );
        }
    }
}

