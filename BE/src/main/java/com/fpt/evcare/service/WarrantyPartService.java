package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.warranty_part.CreationWarrantyPartRequest;
import com.fpt.evcare.dto.request.warranty_part.UpdationWarrantyPartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.WarrantyPartResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface WarrantyPartService {
    WarrantyPartResponse getWarrantyPart(UUID warrantyPartId);
    PageResponse<WarrantyPartResponse> searchWarrantyPart(String keyword, Pageable pageable);
    PageResponse<WarrantyPartResponse> getWarrantyPartsByVehiclePartId(UUID vehiclePartId, Pageable pageable);
    boolean createWarrantyPart(CreationWarrantyPartRequest request);
    boolean updateWarrantyPart(UUID id, UpdationWarrantyPartRequest request);
    boolean deleteWarrantyPart(UUID id);
    boolean restoreWarrantyPart(UUID id);
}
