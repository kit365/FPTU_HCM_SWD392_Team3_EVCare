package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.entity.ServiceTypeEntity;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ServiceTypeService {
    ServiceTypeResponse getServiceTypeById(UUID id);
    PageResponse<ServiceTypeResponse> searchServiceType(String search, Pageable pageable);
    boolean createServiceType(CreationServiceTypeRequest creationServiceTypeRequest);
    boolean updateServiceType(UUID id, UpdationServiceTypeRequest updationServiceTypeRequest);
    boolean deleteServiceType(UUID id);
    void deleteRelatedEntityOfServiceType(ServiceTypeEntity serviceTypeEntity);
    boolean restoreServiceType(UUID id);
}
