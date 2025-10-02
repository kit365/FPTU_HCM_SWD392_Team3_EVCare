package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.ServiceTypeValidationException;
import com.fpt.evcare.mapper.ServiceTypeMapper;
import com.fpt.evcare.repository.ServiceTypeRepository;
import com.fpt.evcare.service.ServiceTypeService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceTypeServiceimpl implements ServiceTypeService {

    ServiceTypeRepository serviceTypeRepository;
    ServiceTypeMapper serviceTypeMapper;

    @Override
    public ServiceTypeResponse getServiceTypeById(UUID id) {
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(id);
        if(serviceTypeEntity == null) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        log.info(ServiceTypeConstants.LOG_INFO_SHOWING_SERVICE_TYPE, id);
        return serviceTypeMapper.toResponse(serviceTypeEntity);
    }

    @Override
    public PageResponse<ServiceTypeResponse> searchServiceType(String search, Pageable pageable) {
        // Bước 1: Lấy tất cả bản ghi từ DB (1 query)
        Page<ServiceTypeEntity> entities;

        if (search.isEmpty()) {
            entities = serviceTypeRepository.findByIsDeletedFalse(pageable);
        } else {
            entities = serviceTypeRepository.findByServiceNameContainingIgnoreCaseAndIsDeletedFalse(search, pageable);
        }

        if (entities.isEmpty()) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        // Bước 2: Tạo Map<id, Response> để lưu tất cả node
        Map<UUID, ServiceTypeResponse> nodeMap = new HashMap<>();
        for (ServiceTypeEntity entity : entities) {
            ServiceTypeResponse response = serviceTypeMapper.toResponse(entity);
            nodeMap.put(response.getServiceTypeId(), response);
        }

        // Bước 3: Xây cây lồng nhau
        List<ServiceTypeResponse> rootNodes = new ArrayList<>();
        for (ServiceTypeResponse node : nodeMap.values()) {
            if (node.getParentId() == null) {
                rootNodes.add(node);
            } else {
                ServiceTypeResponse parent = nodeMap.get(node.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(node);
                }
            }
        }

        log.info(ServiceTypeConstants.LOG_INFO_SHOWING_SERVICE_TYPE_LIST);
        // Bước 4: Trả về list root nodes

        return PageResponse.<ServiceTypeResponse>builder()
                .data(rootNodes)
                .page(entities.getNumber())
                .size(entities.getSize())
                .totalElements(entities.getTotalElements())
                .totalPages(entities.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public boolean createServiceType(CreationServiceTypeRequest creationServiceTypeRequest) {
        checkDuplicateCreationServiceName(creationServiceTypeRequest.getServiceName());
        ServiceTypeEntity serviceTypeEntity = serviceTypeMapper.toEntity(creationServiceTypeRequest);

        // Kiểm tra parent (nếu có)
        if(creationServiceTypeRequest.getParentId() != null){
            ServiceTypeEntity parent = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(creationServiceTypeRequest.getParentId());
            if(parent == null){
                log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
            }

            if(parent.getIsDeleted() != null && parent.getIsDeleted()){
                log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_IS_DELETED);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_DELETED);
            }

            if(hasCycle(creationServiceTypeRequest.getParentId(), serviceTypeEntity.getServiceTypeId())){
                log.warn(ServiceTypeConstants.LOG_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);
                throw new IllegalArgumentException(ServiceTypeConstants.MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);
            }

            // Sync parent entity nếu có parentId
            if(creationServiceTypeRequest.getParentId() != null) {
                ServiceTypeEntity parentEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(creationServiceTypeRequest.getParentId());
                if(parentEntity == null){
                    log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
                    throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
                }
                serviceTypeEntity.setParent(parentEntity);
            }
        }

        // Map và lưu lại xuống database
        serviceTypeEntity.setParentId(creationServiceTypeRequest.getParentId());
        serviceTypeEntity.setSearch(creationServiceTypeRequest.getServiceName().toLowerCase());

        log.info(ServiceTypeConstants.LOG_INFO_CREATING_SERVICE_TYPE);
        serviceTypeRepository.save(serviceTypeEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateServiceType(UUID id, UpdationServiceTypeRequest updationServiceTypeRequest) {
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(id);
        if(serviceTypeEntity == null) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        // Check trung tên dịch vụ
        if(Objects.equals(serviceTypeEntity.getServiceName().toLowerCase(), updationServiceTypeRequest.getServiceName().toLowerCase())){
            serviceTypeEntity.setServiceName(updationServiceTypeRequest.getServiceName());
        } else {
            checkDuplicateCreationServiceName(updationServiceTypeRequest.getServiceName());
            serviceTypeEntity.setServiceName(updationServiceTypeRequest.getServiceName());
        }

        if (updationServiceTypeRequest.getParentId() != null) {
            ServiceTypeEntity parent = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(updationServiceTypeRequest.getParentId());
            if(parent == null) {
                log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
            }

            if(parent.getIsDeleted() != null && parent.getIsDeleted()) {
                log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_IS_DELETED);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_DELETED);}

            if(hasCycle(updationServiceTypeRequest.getParentId(), serviceTypeEntity.getServiceTypeId())) {
                log.warn(ServiceTypeConstants.LOG_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);
                throw new IllegalArgumentException(ServiceTypeConstants.MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);
            }
        }

        serviceTypeMapper.updateServiceType(updationServiceTypeRequest, serviceTypeEntity);
        serviceTypeEntity.setParentId(updationServiceTypeRequest.getParentId()); // Cập nhật parentId

        if (updationServiceTypeRequest.getParentId() != null) {
            serviceTypeEntity.setParent(serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(updationServiceTypeRequest.getParentId()));
            if(serviceTypeEntity.getParent() == null) {
                log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
                throw new IllegalArgumentException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
            }
        } else {
            serviceTypeEntity.setParent(null); // Xóa parent nếu parentId = null
        }

        log.info(ServiceTypeConstants.LOG_INFO_UPDATING_SERVICE_TYPE);
        serviceTypeRepository.save(serviceTypeEntity);
        return false;
    }

    @Override
    public boolean deleteServiceType(UUID id) {
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(id);
        if(serviceTypeEntity == null) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }
        serviceTypeEntity.setIsDeleted(true);

        log.info(ServiceTypeConstants.LOG_INFO_DELETING_SERVICE_TYPE);
        serviceTypeRepository.save(serviceTypeEntity);
        return true;
    }

    @Override
    public boolean restoreServiceType(UUID id){
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findById(id).orElseThrow(() -> {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        });

        serviceTypeEntity.setIsDeleted(false);

        log.info(ServiceTypeConstants.LOG_INFO_RESTORING_SERVICE_TYPE);
        serviceTypeRepository.save(serviceTypeEntity);
        return true;
    }

    private boolean hasCycle(UUID parentId, UUID currentId) {
        // Kiểm tra điều kiên
        if (parentId == null) return false;
        if (parentId.equals(currentId)) return true;

        // Kiểm tra đệ quy (coi con trỏ cha của parent hay đang trỏ chính nó)
        ServiceTypeEntity parent = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(parentId);
        if(parent == null){
            log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
            return false;
        }
        return hasCycle(parent.getParentId(), currentId);
    }

    private void checkDuplicateCreationServiceName(String serviceName) {
        boolean existingServiceType = serviceTypeRepository.existsByServiceNameIgnoreCaseAndIsDeletedFalse(serviceName);
        if (existingServiceType) {
            log.warn(ServiceTypeConstants.LOG_ERR_DUPLICATED_SERVICE_TYPE);
            throw new ServiceTypeValidationException(ServiceTypeConstants.MESSAGE_ERR_DUPLICATED_SERVICE_TYPE);
        }
    }

}