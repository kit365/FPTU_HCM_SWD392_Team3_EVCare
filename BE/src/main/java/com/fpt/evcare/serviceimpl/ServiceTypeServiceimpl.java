package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
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
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findById(id).orElseThrow( () ->
                new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND)
        );

        return serviceTypeMapper.toResponse(serviceTypeEntity);
    }

    @Override
    public List<ServiceTypeResponse> getServiceTree() {
        // Bước 1: Lấy tất cả bản ghi từ DB (1 query)
        List<ServiceTypeEntity> entities = serviceTypeRepository.findByIsDeletedFalseAndIsActiveTrue();
        if (entities.isEmpty()) throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);

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

        // Bước 4: Trả về list root nodes
        return rootNodes;
    }

    @Override
    @Transactional
    public boolean createServiceType(CreationServiceTypeRequest creationServiceTypeRequest) {
        checkDuplicateCreationServiceName(creationServiceTypeRequest.getServiceName());
        ServiceTypeEntity serviceTypeEntity = serviceTypeMapper.toEntity(creationServiceTypeRequest);

        // Kiểm tra parent (nếu có)
        if(creationServiceTypeRequest.getParentId() != null){
            ServiceTypeEntity parent = serviceTypeRepository.findById(creationServiceTypeRequest.getParentId()).orElseThrow(() ->
                    new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND)
            );

            if(parent == null) throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
            if(parent.getIsDeleted() != null && parent.getIsDeleted()) throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_DELETED);
            if(hasCycle(creationServiceTypeRequest.getParentId(), serviceTypeEntity.getServiceTypeId()))
                throw new IllegalArgumentException(ServiceTypeConstants.MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);

            // Sync parent entity nếu có parentId
            if(creationServiceTypeRequest.getParentId() != null) {
                serviceTypeEntity.setParent(
                        serviceTypeRepository.findById(creationServiceTypeRequest.getParentId()).orElseThrow( () ->
                                new IllegalArgumentException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND)
                        )
                );
            }
        }

        // Map và lưu lại xuống database
        serviceTypeEntity.setParentId(creationServiceTypeRequest.getParentId());
        serviceTypeEntity.setSearch(creationServiceTypeRequest.getServiceName().toLowerCase());

        serviceTypeRepository.save(serviceTypeEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateServiceType(UUID id, UpdationServiceTypeRequest updationServiceTypeRequest) {
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND)
        );

        // Check trung tên dịch vụ
        if(Objects.equals(serviceTypeEntity.getServiceName().toLowerCase(), updationServiceTypeRequest.getServiceName().toLowerCase())){
            serviceTypeEntity.setServiceName(updationServiceTypeRequest.getServiceName());
        } else {
            if (serviceTypeRepository.existsByServiceNameIgnoreCase(updationServiceTypeRequest.getServiceName())) {
                throw new ServiceTypeValidationException(ServiceTypeConstants.MESSAGE_ERR_DUPLICATED_SERVICE_TYPE);
            }
                serviceTypeEntity.setServiceName(updationServiceTypeRequest.getServiceName());
        }

        if (updationServiceTypeRequest.getParentId() != null) {
            ServiceTypeEntity parent = serviceTypeRepository.findById(updationServiceTypeRequest.getParentId()).orElseThrow( () ->
                    new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND)
            );

            if(parent == null) throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
            if(parent.getIsDeleted() != null && parent.getIsDeleted()) throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_DELETED);
            if(hasCycle(updationServiceTypeRequest.getParentId(), serviceTypeEntity.getServiceTypeId()))
                throw new IllegalArgumentException(ServiceTypeConstants.MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);

        }

        serviceTypeMapper.updateServiceType(updationServiceTypeRequest, serviceTypeEntity);
        serviceTypeEntity.setParentId(updationServiceTypeRequest.getParentId()); // Cập nhật parentId

        if (updationServiceTypeRequest.getParentId() != null) {
            serviceTypeEntity.setParent(serviceTypeRepository.findById(updationServiceTypeRequest.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND)));
        } else {
            serviceTypeEntity.setParent(null); // Xóa parent nếu parentId = null
        }

        serviceTypeRepository.save(serviceTypeEntity);
        return false;
    }

    @Override
    public boolean deleteServiceType(UUID id) {
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND)
        );
        serviceTypeEntity.setIsDeleted(true);

        serviceTypeRepository.save(serviceTypeEntity);
        return true;
    }

    private boolean hasCycle(UUID parentId, UUID currentId) {
        // Kiểm tra điều kiên
        if (parentId == null) return false;
        if (parentId.equals(currentId)) return true;

        // Kiểm tra đệ quy (coi con trỏ cha của parent hay đang trỏ chính nó)
        ServiceTypeEntity parent = serviceTypeRepository.findById(parentId).orElseThrow( () ->
                new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND)
        );

        if (parent == null) return false;
        return hasCycle(parent.getParentId(), currentId);
    }

    private void checkDuplicateCreationServiceName(String serviceName) {
        ServiceTypeEntity existingServiceType = serviceTypeRepository.findByServiceNameIgnoreCase(serviceName);
        if (existingServiceType != null) throw new ServiceTypeValidationException(ServiceTypeConstants.MESSAGE_ERR_DUPLICATED_SERVICE_TYPE);
    }
}