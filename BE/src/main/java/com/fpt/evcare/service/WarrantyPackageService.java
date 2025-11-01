package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.warranty_package.CreationWarrantyPackageRequest;
import com.fpt.evcare.dto.request.warranty_package.UpdationWarrantyPackageRequest;
import com.fpt.evcare.dto.request.warranty_package.CreationWarrantyPackagePartRequest;
import com.fpt.evcare.dto.request.warranty_package.UpdationWarrantyPackagePartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.WarrantyPackageResponse;
import com.fpt.evcare.dto.response.WarrantyPackagePartResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface WarrantyPackageService {
    WarrantyPackageResponse getWarrantyPackageById(UUID id);
    PageResponse<WarrantyPackageResponse> searchWarrantyPackages(String keyword, Boolean isValid, Pageable pageable);
    boolean createWarrantyPackage(CreationWarrantyPackageRequest request);
    boolean updateWarrantyPackage(UUID id, UpdationWarrantyPackageRequest request);
    boolean deleteWarrantyPackage(UUID id);
    
    // WarrantyPackagePart methods
    WarrantyPackagePartResponse getWarrantyPackagePartById(UUID id);
    PageResponse<WarrantyPackagePartResponse> getWarrantyPackagePartsByPackageId(UUID warrantyPackageId, Pageable pageable);
    boolean createWarrantyPackagePart(UUID warrantyPackageId, CreationWarrantyPackagePartRequest request);
    boolean updateWarrantyPackagePart(UUID id, UpdationWarrantyPackagePartRequest request);
    boolean deleteWarrantyPackagePart(UUID id);
    
    // Check warranty validity
    boolean isVehiclePartUnderWarranty(UUID vehicleId, UUID vehiclePartId);
}

