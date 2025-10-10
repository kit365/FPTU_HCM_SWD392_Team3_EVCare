package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AppointmentConstants;
import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.constants.ServiceTypeVehiclePartConstants;
import com.fpt.evcare.dto.request.service_type.CreationServiceTypeRequest;
import com.fpt.evcare.dto.request.service_type.UpdationServiceTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.dto.response.ServiceTypeVehiclePartResponse;
import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.ServiceTypeValidationException;
import com.fpt.evcare.mapper.ServiceTypeMapper;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.ServiceTypeRepository;
import com.fpt.evcare.repository.ServiceTypeVehiclePartRepository;
import com.fpt.evcare.service.ServiceTypeService;
import com.fpt.evcare.service.ServiceTypeVehiclePartService;
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

    ServiceTypeVehiclePartService serviceTypeVehiclePartService;
    AppointmentRepository appointmentRepository;
    ServiceTypeRepository serviceTypeRepository;
    ServiceTypeMapper serviceTypeMapper;
    private final ServiceTypeVehiclePartRepository serviceTypeVehiclePartRepository;

    @Override
    public ServiceTypeResponse getServiceTypeById(UUID id) {
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(id);
        if(serviceTypeEntity == null) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        ServiceTypeResponse serviceTypeResponse = serviceTypeMapper.toResponse(serviceTypeEntity);

        List<ServiceTypeVehiclePartResponse> serviceTypeVehiclePartResponses = serviceTypeVehiclePartService.getVehiclePartByServiceTypeId(id);
        serviceTypeResponse.setServiceTypeVehiclePartResponses(serviceTypeVehiclePartResponses.isEmpty() ? null : serviceTypeVehiclePartResponses);

        log.info(ServiceTypeConstants.LOG_INFO_SHOWING_SERVICE_TYPE, id);
        return serviceTypeResponse;
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

            //Lấy danh sách vehicle part trong bảng trung gian
            List<ServiceTypeVehiclePartResponse> serviceTypeVehiclePartResponses = serviceTypeVehiclePartService.getVehiclePartByServiceTypeId(entity.getServiceTypeId());
            response.setServiceTypeVehiclePartResponses(serviceTypeVehiclePartResponses.isEmpty() ? null : serviceTypeVehiclePartResponses);

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
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);
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

        log.info(ServiceTypeConstants.LOG_INFO_CREATING_SERVICE_TYPE, serviceTypeEntity.getServiceTypeId());
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
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_CYCLE_IN_SERVICE_TYPE_HIERARCHY);
            }
        }

        serviceTypeMapper.updateServiceType(updationServiceTypeRequest, serviceTypeEntity);
        serviceTypeEntity.setParentId(updationServiceTypeRequest.getParentId()); // Cập nhật parentId

        if (updationServiceTypeRequest.getParentId() != null) {
            serviceTypeEntity.setParent(serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(updationServiceTypeRequest.getParentId()));
            if(serviceTypeEntity.getParent() == null) {
                log.warn(ServiceTypeConstants.LOG_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
                throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_PARENT_SERVICE_TYPE_NOT_FOUND);
            }
        } else {
            serviceTypeEntity.setParent(null); // Xóa parent nếu parentId = null
        }

        log.info(ServiceTypeConstants.LOG_INFO_UPDATING_SERVICE_TYPE, id);
        serviceTypeRepository.save(serviceTypeEntity);
        return true;
    }

    //HÀM XÓA DỊCH VỤ
    @Override
    @Transactional
    public boolean deleteServiceType(UUID id) {
        ServiceTypeEntity serviceType = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(id);
        if (serviceType == null) {
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND, id);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        // Kiểm tra ràng buộc trước khi xóa
        checkConstraintsForServiceType(serviceType);

        // Nếu là ServiceType cha, kiểm tra và xóa các con
        if (serviceType.getParent() == null) {
            List<ServiceTypeEntity> childServiceTypes = serviceTypeRepository.findByParentServiceTypeIdAndIsDeletedFalse(id);
            for (ServiceTypeEntity child : childServiceTypes) {
                checkConstraintsForServiceType(child);
                deleteRelatedEntityOfServiceType(child);
            }
        }

        // Xóa các thực thể liên quan của ServiceType hiện tại
        deleteRelatedEntityOfServiceType(serviceType);

        log.info(ServiceTypeConstants.LOG_INFO_DELETING_SERVICE_TYPE, id);
        return true;
    }

    //HÀM XÓA CÁC THỰC THỂ LIÊN QUAN TỚI LOẠI DỊCH VỤ ĐÓ
    @Override
    public void deleteRelatedEntityOfServiceType(ServiceTypeEntity serviceTypeEntity) {
        UUID serviceTypeId = serviceTypeEntity.getServiceTypeId();

        // Tìm các Appointment có trạng thái PENDING để cập nhật
        List<AppointmentEntity> pendingAppointments = appointmentRepository.findByServiceTypeIdAndStatusPending(serviceTypeId);

        // Cập nhật trạng thái và gửi thông báo
        if (!pendingAppointments.isEmpty()) {
            pendingAppointments.forEach(appointment -> {
                appointment.setStatus(AppointmentStatusEnum.CANCELLED);

                // thực hiện xóa serviceType trong appointment
                List<ServiceTypeEntity> serviceTypes = appointment.getServiceTypes();
                serviceTypes.forEach(serviceType -> {
                    if (serviceType.getServiceTypeId().equals(serviceTypeId)) {
                        serviceType.setIsDeleted(true);
                    }
                });
                appointment.setServiceTypes(serviceTypes);

                appointmentRepository.save(appointment);

                // KHI NÀO LÀM PHẦN THÔNG BÁO, NHỚ CHỈNH PHẦN NÀY CHO HỢP LOGIC
//                // Gửi thông báo cho khách hàng
//                try {
//                    notificationService.sendNotification(
//                            appointment.getUser(),
//                            "Service Discontinued",
//                            String.format("Your appointment (ID: %s) has been cancelled as the service '%s' is no longer supported.",
//                                    appointment.getAppointmentId(), serviceTypeEntity.getName())
//                    );
//                } catch (Exception e) {
//                    log.error("Failed to send notification for appointment {}: {}",
//                            appointment.getAppointmentId(), e.getMessage());
//                }
            });
        }

        // Xóa ServiceTypeVehiclePart liên quan (Nếu có)
        serviceTypeVehiclePartService.deleteServiceTypeVehiclePartByServiceTypeId(serviceTypeId);

        // Đánh dấu ServiceType là đã xóa
        serviceTypeEntity.setIsDeleted(true);
        serviceTypeRepository.save(serviceTypeEntity);
        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_DELETING_SERVICE_TYPE_VEHICLE_PART_FOR_SERVICE_TYPE, serviceTypeId);
    }

    //HÀM KHÔI PHỤC DỊCH VỤ CON
    @Override
    public boolean restoreServiceType(UUID id){
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedTrue(id);
        if(serviceTypeEntity == null){
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }

        // Nếu service type này là cha, đồng thời khôi phục luôn con
        if(serviceTypeEntity.getParentId() == null) {
            List<ServiceTypeEntity> childServiceTypes = serviceTypeRepository.findByParentServiceTypeIdAndIsDeletedTrue(id);
            if(!childServiceTypes.isEmpty()) {
                childServiceTypes.forEach(childServiceType -> childServiceType.setIsDeleted(false));
            }
        } else {
            ServiceTypeEntity parentServiceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedTrue(serviceTypeEntity.getParentId());

            // Khôi phục cha của service type con (nếu có)
            if(parentServiceTypeEntity != null) {
                parentServiceTypeEntity.setIsDeleted(false);
            }
        }

        serviceTypeEntity.setIsDeleted(false);

        log.info(ServiceTypeConstants.LOG_INFO_RESTORING_SERVICE_TYPE, id);
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

    private void checkConstraintsForServiceType(ServiceTypeEntity serviceType) {
        UUID serviceTypeId = serviceType.getServiceTypeId();

        // Sử dụng existsActiveAppointmentsByServiceTypeId để kiểm tra
        boolean hasActiveAppointments = appointmentRepository
                .existsActiveAppointmentsByServiceTypeId(serviceTypeId);

        // Nếu có ít nhất 1 thỏa điều kiện truy vấn => không cho xóa bảng liên quan đến service type đó
        if (hasActiveAppointments) {
            log.warn(ServiceTypeConstants.LOG_ERR_CAN_NOT_DELETE_SERVICE_TYPE, serviceTypeId);
            throw new IllegalStateException(ServiceTypeConstants.MESSAGE_ERR_CAN_NOT_DELETE_SERVICE_TYPE);
        }
    }
}