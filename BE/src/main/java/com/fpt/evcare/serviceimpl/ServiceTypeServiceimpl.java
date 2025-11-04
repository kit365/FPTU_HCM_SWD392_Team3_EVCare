package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.constants.ServiceTypeVehiclePartConstants;
import com.fpt.evcare.constants.VehicleTypeConstants;
import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.dto.response.ServiceTypeVehiclePartResponse;
import com.fpt.evcare.dto.response.VehicleTypeResponse;
import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.entity.ServiceTypeVehiclePartEntity;
import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.ServiceTypeMapper;
import com.fpt.evcare.repository.*;
import com.fpt.evcare.service.AppointmentService;
import com.fpt.evcare.service.ServiceTypeService;
import com.fpt.evcare.service.ServiceTypeVehiclePartService;
import com.fpt.evcare.utils.UtilFunction;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceTypeServiceimpl implements ServiceTypeService {

    ServiceTypeVehiclePartService serviceTypeVehiclePartService;
    VehicleTypeRepository vehicleTypeRepository;
    ServiceTypeRepository serviceTypeRepository;
    ServiceTypeMapper serviceTypeMapper;
    ServiceTypeVehiclePartRepository serviceTypeVehiclePartRepository;

    @Override
    public List<ServiceTypeResponse> getParentServiceListByVehicleTypeId(UUID vehicleTypeId){
        List<ServiceTypeEntity> serviceTypeEntityList = serviceTypeRepository.findByServiceTypeIdAndParentIdIsNullAndIsDeletedFalse(vehicleTypeId);
        if(serviceTypeEntityList.isEmpty()){
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_LIST_NOT_FOUND_BY_VEHICLE_TYPE_ID, vehicleTypeId);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_LIST_NOT_FOUND_BY_VEHICLE_TYPE_ID);
        }

        return serviceTypeEntityList.stream().map(serviceTypeEntity -> {
            ServiceTypeResponse serviceTypeResponse = new ServiceTypeResponse();
            serviceTypeResponse.setServiceTypeId(serviceTypeEntity.getServiceTypeId());
            serviceTypeResponse.setServiceName(serviceTypeEntity.getServiceName());

            return serviceTypeResponse;
        }).collect(Collectors.toList());
    }

    @Override
    public List<ServiceTypeResponse> getChildrenServiceByParentIdAndVehicleTypeId(UUID parentId, UUID vehicleTypeId){
        List<ServiceTypeEntity> serviceTypeEntities = serviceTypeRepository.findByVehicleTypeAndParent(vehicleTypeId, parentId);
        if(serviceTypeEntities.isEmpty()){
            log.warn(ServiceTypeConstants.LOG_ERR_CHILDREN_SERVICE_TYPE_LIST_NOT_FOUND_BY_VEHICLE_TYPE_ID_AND_PARENT_ID, vehicleTypeId, parentId);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_CHILDREN_SERVICE_TYPE_LIST_NOT_FOUND_BY_VEHICLE_TYPE_ID_AND_PARENT_ID);
        }

        return serviceTypeEntities.stream().map(serviceTypeEntity -> {
            ServiceTypeResponse serviceTypeResponse = new ServiceTypeResponse();
            serviceTypeResponse.setServiceTypeId(serviceTypeEntity.getServiceTypeId());
            serviceTypeResponse.setServiceName(serviceTypeEntity.getServiceName());

            return serviceTypeResponse;
        }).collect(Collectors.toList());
    }

    @Override
    public List<ServiceTypeResponse> getAllServiceTypesByVehicleTypeForAppointment(UUID vehicleTypeId) {
        List<ServiceTypeEntity> serviceTypeEntities = serviceTypeRepository.findByVehicleTypeEntityVehicleTypeIdAndIsDeletedFalse(vehicleTypeId);

        if (serviceTypeEntities.isEmpty()) {
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_NOT_FOUND + vehicleTypeId);
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }

        // Bước 2: Tạo Map<id, Response> để lưu tất cả node
        Map<UUID, ServiceTypeResponse> nodeMap = new HashMap<>();
        for (ServiceTypeEntity entity : serviceTypeEntities) {
            ServiceTypeResponse response = new ServiceTypeResponse();
            response.setServiceTypeId(entity.getServiceTypeId());
            response.setServiceName(entity.getServiceName());
            response.setParentId(entity.getParentId());
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

        log.info(ServiceTypeConstants.LOG_INFO_SHOWING_SERVICE_TYPE_LIST_BY_VEHICLE_TYPE_FOR_APPOINTMENT + vehicleTypeId);
        return rootNodes;
    }

    @Override
    public ServiceTypeResponse getServiceTypeById(UUID id) {
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(id);
        if (serviceTypeEntity == null) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        // Nếu có parent, lấy cha gốc
        ServiceTypeEntity rootEntity = serviceTypeEntity.getParent() != null
                ? serviceTypeEntity.getParent()
                : serviceTypeEntity;

        // Map sang response
        ServiceTypeResponse rootResponse = serviceTypeMapper.toResponse(rootEntity);

        // Lấy danh sách vehicle part cho cha
        List<ServiceTypeVehiclePartResponse> parentParts = serviceTypeVehiclePartService.getVehiclePartResponseByServiceTypeId(rootEntity.getServiceTypeId());
        rootResponse.setServiceTypeVehiclePartResponses(parentParts.isEmpty() ? null : parentParts);

        // Lấy thông tin loại xe
        VehicleTypeEntity vehicleTypeEntity = serviceTypeEntity.getVehicleTypeEntity();
        VehicleTypeResponse vehicleTypeResponse = new VehicleTypeResponse();
        vehicleTypeResponse.setVehicleTypeId(vehicleTypeEntity.getVehicleTypeId());
        vehicleTypeResponse.setVehicleTypeName(vehicleTypeEntity.getVehicleTypeName());
        rootResponse.setVehicleTypeResponse(vehicleTypeResponse);

        // Nếu đang là con, gắn con vào cha
        if (serviceTypeEntity.getParent() != null) {
            ServiceTypeResponse childResponse = serviceTypeMapper.toResponse(serviceTypeEntity);

            List<ServiceTypeVehiclePartResponse> childParts = serviceTypeVehiclePartService.getVehiclePartResponseByServiceTypeId(serviceTypeEntity.getServiceTypeId());
            childResponse.setServiceTypeVehiclePartResponses(childParts.isEmpty() ? null : childParts);

            rootResponse.setChildren(List.of(childResponse));
        }

        log.info(ServiceTypeConstants.LOG_INFO_SHOWING_SERVICE_TYPE, id);
        return rootResponse;
    }

    @Override
    public PageResponse<ServiceTypeResponse> searchServiceType(String search, UUID vehicleTypeId, Boolean isActive, Pageable pageable) {
        // Bước 1: Lấy tất cả bản ghi từ DB với filter isActive
        Page<ServiceTypeEntity> entities;
        log.info(ServiceTypeConstants.LOG_INFO_FILTERING_SERVICES, vehicleTypeId, isActive);

        if (search.isEmpty()) {
            entities = serviceTypeRepository.findByVehicleTypeIdAndIsActive(vehicleTypeId, isActive, pageable);
        } else {
            entities = serviceTypeRepository.findByVehicleTypeIdAndSearchAndIsActive(vehicleTypeId, search, isActive, pageable);
        }

        // Nếu không có kết quả sau khi filter, trả về empty list (không throw exception)
        if (entities.isEmpty()) {
            log.info(ServiceTypeConstants.LOG_INFO_NO_SERVICES_FOUND, vehicleTypeId, isActive);
            return PageResponse.<ServiceTypeResponse>builder()
                    .data(List.of())
                    .page(entities.getNumber())
                    .size(entities.getSize())
                    .totalElements(0L)
                    .totalPages(0)
                    .build();
        }

        // Bước 2: Build parent services và load children cho mỗi parent
        List<ServiceTypeResponse> rootNodes = new ArrayList<>();
        for (ServiceTypeEntity parentEntity : entities) {
            ServiceTypeResponse parentResponse = serviceTypeMapper.toResponse(parentEntity);

            //Lấy danh sách vehicle part trong bảng trung gian cho parent
            List<ServiceTypeVehiclePartResponse> parentVehicleParts = serviceTypeVehiclePartService.getVehiclePartResponseByServiceTypeId(parentEntity.getServiceTypeId());
            parentResponse.setServiceTypeVehiclePartResponses(parentVehicleParts.isEmpty() ? null : parentVehicleParts);

            // Load children cho parent này
            List<ServiceTypeEntity> childrenEntities = serviceTypeRepository.findByParentServiceTypeIdAndIsDeletedFalse(parentEntity.getServiceTypeId());
            List<ServiceTypeResponse> childrenResponses = new ArrayList<>();
            
            for (ServiceTypeEntity childEntity : childrenEntities) {
                // Filter children theo isActive nếu cần
                if (isActive != null && !childEntity.getIsActive().equals(isActive)) {
                    continue;
                }
                
                ServiceTypeResponse childResponse = serviceTypeMapper.toResponse(childEntity);
                
                //Lấy vehicle parts cho child
                List<ServiceTypeVehiclePartResponse> childVehicleParts = serviceTypeVehiclePartService.getVehiclePartResponseByServiceTypeId(childEntity.getServiceTypeId());
                childResponse.setServiceTypeVehiclePartResponses(childVehicleParts.isEmpty() ? null : childVehicleParts);
                
                childrenResponses.add(childResponse);
            }
            
            parentResponse.setChildren(childrenResponses.isEmpty() ? null : childrenResponses);
            rootNodes.add(parentResponse);
        }

        log.info(ServiceTypeConstants.LOG_INFO_SHOWING_SERVICE_TYPE_LIST_BY_VEHICLE_TYPE + vehicleTypeId);
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
        checkDuplicateCreationServiceName(creationServiceTypeRequest.getServiceName(), creationServiceTypeRequest.getVehicleTypeId());
        ServiceTypeEntity serviceTypeEntity = serviceTypeMapper.toEntity(creationServiceTypeRequest);

        // Gán vehicle type
        VehicleTypeEntity vehicleType = validateAndGetVehicleType(creationServiceTypeRequest.getVehicleTypeId());
        serviceTypeEntity.setVehicleTypeEntity(vehicleType);

        // Kiểm tra và gán parent (nếu có)
        if (creationServiceTypeRequest.getParentId() != null) {
            ServiceTypeEntity parent = validateAndGetParent(creationServiceTypeRequest.getParentId(), serviceTypeEntity.getServiceTypeId(), vehicleType.getVehicleTypeId());
            serviceTypeEntity.setParent(parent);
            serviceTypeEntity.setParentId(parent.getServiceTypeId());
        }

        String search = UtilFunction.concatenateSearchField(creationServiceTypeRequest.getServiceName(),
                vehicleType.getVehicleTypeName(),
                vehicleType.getManufacturer()
                );
        serviceTypeEntity.setSearch(search);

        log.info(ServiceTypeConstants.LOG_INFO_CREATING_SERVICE_TYPE, serviceTypeEntity.getServiceTypeId());
        serviceTypeRepository.save(serviceTypeEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateServiceType(UUID id, UpdationServiceTypeRequest updationServiceTypeRequest) {
        checkDependOnAppointmentByServiceTypeId(id);

        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(id);
        if (serviceTypeEntity == null) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        // Check trùng tên dịch vụ
        if (!serviceTypeEntity.getServiceName().equalsIgnoreCase(updationServiceTypeRequest.getServiceName())) {
            checkDuplicateCreationServiceName(updationServiceTypeRequest.getServiceName(), serviceTypeEntity.getVehicleTypeEntity().getVehicleTypeId());
        }
        serviceTypeEntity.setServiceName(updationServiceTypeRequest.getServiceName());

        // Gán vehicle type
        VehicleTypeEntity vehicleType = serviceTypeEntity.getVehicleTypeEntity();
        String search = UtilFunction.concatenateSearchField(updationServiceTypeRequest.getServiceName(),
                vehicleType.getVehicleTypeName(),
                vehicleType.getManufacturer()
        );
        serviceTypeEntity.setSearch(search);

        log.info(ServiceTypeConstants.LOG_INFO_UPDATING_SERVICE_TYPE, id);
        serviceTypeMapper.updateServiceType(updationServiceTypeRequest, serviceTypeEntity);
        serviceTypeRepository.save(serviceTypeEntity);
        return true;
    }

    //HÀM XÓA DỊCH VỤ
    @Override
    @Transactional
    public boolean deleteServiceType(UUID id) {
        ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(id);
        if (serviceType == null) {
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        checkDependOnAppointmentByServiceTypeId(id);

        // Nếu là cha, xóa các con, đồng thời xóa bảng trung gian mà các con và cha có
        if (serviceType.getParentId() == null) {
            List<ServiceTypeEntity> children = serviceTypeRepository.findByParentServiceTypeIdAndIsDeletedFalse(id);
            for (ServiceTypeEntity child : children) {
                checkDependOnAppointmentByServiceTypeId(child.getServiceTypeId());
                deleteVehiclePartsOfServiceType(child);
                log.info(ServiceTypeConstants.LOG_INFO_DELETING_SERVICE_TYPE, id);
                child.setIsDeleted(true);
            }
            serviceTypeRepository.saveAll(children);
        }
        deleteVehiclePartsOfServiceType(serviceType);

        log.info(ServiceTypeConstants.LOG_INFO_DELETING_SERVICE_TYPE, id);
        serviceType.setIsDeleted(true);
        serviceTypeRepository.save(serviceType);
        return true;
    }

    // Xóa các bản ghi trung gian có liên kết với dịch vụ này
    private void deleteVehiclePartsOfServiceType(ServiceTypeEntity serviceType) {
        serviceType.getServiceTypeVehiclePartList().forEach(serviceTypeVehiclePartEntity -> {
            log.info(ServiceTypeVehiclePartConstants.LOG_INFO_DELETING_SERVICE_TYPE_VEHICLE_PART, serviceTypeVehiclePartEntity.getServiceTypeVehiclePartId());
            // Thực hiện xóa nếu vehicle thỏa không thuộc trong active appointment
            serviceTypeVehiclePartEntity.setIsDeleted(true);
            serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
        });
    }

    //HÀM KHÔI PHỤC DỊCH VỤ CON
    @Override
    public boolean restoreServiceType(UUID id) {
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedTrue(id);
        if (serviceTypeEntity == null) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND, id);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        // Danh sách các entity cần khôi phục
        List<ServiceTypeEntity> entitiesToRestore = new ArrayList<>();

        // Nếu là CHA
        if (serviceTypeEntity.getParentId() == null) {
            List<ServiceTypeEntity> childServiceTypes = serviceTypeRepository.findByParentServiceTypeIdAndIsDeletedTrue(id);
            if (!childServiceTypes.isEmpty()) {
                childServiceTypes.forEach(child -> {
                    child.setIsDeleted(false);

                    //Khôi phục con, đồng thời khôi phục bảng trung gian
                    child.getServiceTypeVehiclePartList().forEach(serviceTypeVehiclePartEntity -> {
                        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_RESTORING_SERVICE_TYPE_VEHICLE_PART, serviceTypeVehiclePartEntity.getServiceTypeVehiclePartId());
                        serviceTypeVehiclePartEntity.setIsDeleted(false);
                        serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
                    });
                });
                entitiesToRestore.addAll(childServiceTypes);
                log.info(ServiceTypeConstants.LOG_INFO_RESTORING_CHILD_SERVICE_TYPE, id);
            }
        }
        // Nếu là CON (Một mình)
        else {
            ServiceTypeEntity parentServiceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedTrue(serviceTypeEntity.getParentId());

            if (parentServiceTypeEntity != null) {
                parentServiceTypeEntity.setIsDeleted(false);

                //Khôi phục bảng trung gian của dịch vụ
                parentServiceTypeEntity.getServiceTypeVehiclePartList().forEach(serviceTypeVehiclePartEntity -> {
                    log.info(ServiceTypeConstants.LOG_INFO_RESTORING_SERVICE_TYPE, serviceTypeVehiclePartEntity.getServiceTypeVehiclePartId());
                    serviceTypeVehiclePartEntity.setIsDeleted(false);
                    serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
                });

                entitiesToRestore.add(parentServiceTypeEntity);
                log.info(ServiceTypeConstants.LOG_INFO_RESTORING_PARENT_SERVICE_TYPE, parentServiceTypeEntity.getServiceTypeId());
            }
        }

        // Khôi phục chính entity hiện tại
        serviceTypeEntity.setIsDeleted(false);
        entitiesToRestore.add(serviceTypeEntity);

        log.info(ServiceTypeConstants.LOG_INFO_RESTORING_SERVICE_TYPE, id);
        serviceTypeRepository.saveAll(entitiesToRestore);

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

    private ServiceTypeEntity validateAndGetParent(UUID parentId, UUID currentId, UUID vehicleTypeId) {
        ServiceTypeEntity parent = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(parentId);
        if(parent == null){
            log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
            throw new EntityValidationException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
        }

        if(parent.getIsDeleted() != null && parent.getIsDeleted()){
            log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_IS_DELETED);
            throw new EntityValidationException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_DELETED);
        }

        if(hasCycle(parentId, currentId)){
            log.warn(ServiceTypeConstants.LOG_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);
            throw new EntityValidationException(ServiceTypeConstants.MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);
        }

        // 🚗 Kiểm tra loại xe của con và cha phải trùng nhau
        if (parent.getVehicleTypeEntity() != null && vehicleTypeId != null) {
            UUID parentVehicleTypeId = parent.getVehicleTypeEntity().getVehicleTypeId();
            if (!parentVehicleTypeId.equals(vehicleTypeId)) {
                log.warn(ServiceTypeConstants.LOG_ERR_VEHICLE_TYPE_DOES_NOT_MATCH_BETWEEN_BOTH_SERVICES, vehicleTypeId);
                throw new EntityValidationException(ServiceTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_DOES_NOT_MATCH_BETWEEN_BOTH_SERVICES);
            }
        }

        return parent;
    }

    private VehicleTypeEntity validateAndGetVehicleType(UUID vehicleTypeId) {
        VehicleTypeEntity vehicleType = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(vehicleTypeId);
        if (vehicleType == null) {
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_NOT_FOUND + vehicleTypeId);
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }
        return vehicleType;
    }

    private void checkDuplicateCreationServiceName(String serviceName, UUID serviceTypeId) {
        if (serviceTypeRepository.existsByServiceNameAndVehicleTypeId(serviceName, serviceTypeId)) {
            log.warn(ServiceTypeConstants.LOG_ERR_DUPLICATED_SERVICE_TYPE);
            throw new EntityValidationException(ServiceTypeConstants.MESSAGE_ERR_DUPLICATED_SERVICE_TYPE);
        }
    }

    public void checkDependOnAppointmentByServiceTypeId(UUID serviceTypeId){
        boolean existedActiveAppointmentByServiceTypeId = serviceTypeVehiclePartRepository.existsActiveAppointmentsInServiceTypeVehiclePartByServiceTypeId(serviceTypeId);
        if(existedActiveAppointmentByServiceTypeId){
            log.warn(ServiceTypeConstants.LOG_ERR_CAN_NOT_DELETE_SERVICE_TYPE + serviceTypeId);
            throw new EntityValidationException(ServiceTypeConstants.MESSAGE_ERR_CAN_NOT_DELETE_SERVICE_TYPE);
        }
    }
}