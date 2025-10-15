package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AppointmentConstants;
import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.constants.ServiceTypeVehiclePartConstants;
import com.fpt.evcare.constants.VehiclePartConstants;
import com.fpt.evcare.dto.request.service_type_vehicle_part.CreationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.request.service_type_vehicle_part.UpdationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.dto.response.ServiceTypeVehiclePartResponse;
import com.fpt.evcare.dto.response.VehiclePartResponse;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.ServiceTypeVehiclePartMapper;
import com.fpt.evcare.repository.*;
import com.fpt.evcare.service.ServiceTypeService;
import com.fpt.evcare.service.ServiceTypeVehiclePartService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceTypeVehiclePartServiceImpl implements ServiceTypeVehiclePartService {

    ServiceTypeVehiclePartRepository serviceTypeVehiclePartRepository;
    ServiceTypeVehiclePartMapper serviceTypeVehiclePartMapper;
    ServiceTypeRepository serviceTypeRepository;
    VehiclePartRepository vehiclePartRepository;
    AppointmentRepository appointmentRepository;

    @Override
    public ServiceTypeVehiclePartResponse getServiceTypeVehiclePartById(UUID id){
        ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity = serviceTypeVehiclePartRepository.findByServiceTypeVehiclePartIdAndIsDeletedFalse(id);
        if(serviceTypeVehiclePartEntity == null){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND);
        }

        ServiceTypeVehiclePartResponse serviceTypeVehiclePartResponse = serviceTypeVehiclePartMapper.toResponse(serviceTypeVehiclePartEntity);

        ServiceTypeEntity serviceTypeEntity = serviceTypeVehiclePartEntity.getServiceType();
        ServiceTypeResponse serviceTypeResponse = new ServiceTypeResponse();
        serviceTypeResponse.setServiceTypeId(serviceTypeEntity.getServiceTypeId());
        serviceTypeResponse.setServiceName(serviceTypeEntity.getServiceName());
        serviceTypeVehiclePartResponse.setServiceType(serviceTypeResponse);

        VehiclePartEntity vehiclePartEntity = serviceTypeVehiclePartEntity.getVehiclePart();
        VehiclePartResponse partResponse = new VehiclePartResponse();
        partResponse.setVehiclePartId(vehiclePartEntity.getVehiclePartId());
        partResponse.setVehiclePartName(vehiclePartEntity.getVehiclePartName());
        partResponse.setCurrentQuantity(vehiclePartEntity.getCurrentQuantity());
        partResponse.setMinStock(vehiclePartEntity.getMinStock());
        partResponse.setUnitPrice(vehiclePartEntity.getUnitPrice());

        serviceTypeVehiclePartResponse.setVehiclePart(partResponse);

        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_SHOWING_SERVICE_TYPE_VEHICLE_PART + id);
        return serviceTypeVehiclePartResponse;
    }

    @Override
    public List<ServiceTypeVehiclePartResponse> getVehiclePartResponseByServiceTypeId(UUID id) {
        List<ServiceTypeVehiclePartEntity> serviceTypeVehiclePartEntityList = serviceTypeVehiclePartRepository.findAllByServiceTypeServiceTypeIdAndIsDeletedFalse(id);

        if(!serviceTypeVehiclePartEntityList.isEmpty()){
            List<ServiceTypeVehiclePartResponse> responseList = serviceTypeVehiclePartEntityList.stream().map(serviceTypeVehiclePartEntity -> {

                ServiceTypeVehiclePartResponse serviceTypeVehiclePartResponse = new ServiceTypeVehiclePartResponse();
            serviceTypeVehiclePartResponse.setServiceTypeVehiclePartId(serviceTypeVehiclePartEntity.getServiceTypeVehiclePartId());
            serviceTypeVehiclePartResponse.setRequiredQuantity(serviceTypeVehiclePartEntity.getRequiredQuantity());
            serviceTypeVehiclePartResponse.setEstimatedTimeDefault(serviceTypeVehiclePartEntity.getEstimatedTimeDefault());

            VehiclePartEntity vehiclePartEntity = serviceTypeVehiclePartEntity.getVehiclePart();
            if(vehiclePartEntity != null){
                VehiclePartResponse vehiclePartResponse = new VehiclePartResponse();
                vehiclePartResponse.setVehiclePartId(vehiclePartEntity.getVehiclePartId());
                vehiclePartResponse.setVehiclePartName(vehiclePartEntity.getVehiclePartName());
                vehiclePartResponse.setCurrentQuantity(vehiclePartEntity.getCurrentQuantity());
                vehiclePartResponse.setMinStock(vehiclePartEntity.getMinStock());
                vehiclePartResponse.setUnitPrice(vehiclePartEntity.getUnitPrice());

                serviceTypeVehiclePartResponse.setVehiclePart(vehiclePartResponse);
            }

            return serviceTypeVehiclePartResponse;

        }).toList();

            log.info(ServiceTypeVehiclePartConstants.LOG_INFO_SHOWING_SERVICE_TYPE_VEHICLE_PART_LIST_BY_SERVICE_TYPE_ID + id);
            return responseList;
        }

        return Collections.emptyList();
    }

    @Override
    @Transactional
    public boolean createServiceTypeVehiclePart(CreationServiceTypeVehiclePartRequest creationServiceTypeVehiclePartRequest) {
        ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity = serviceTypeVehiclePartMapper.toEntity(creationServiceTypeVehiclePartRequest);

        // Thêm dịch vụ vào danh sách
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(creationServiceTypeVehiclePartRequest.getServiceTypeId());
        if(serviceTypeEntity == null){
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);

            //Kiểm tra chỉ nhận dịch vụ con
        } else if(serviceTypeEntity.getParentId() == null){
            log.warn(ServiceTypeConstants.LOG_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE + creationServiceTypeVehiclePartRequest.getServiceTypeId());
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE);
        }
        serviceTypeVehiclePartEntity.setServiceType(serviceTypeEntity);

        //Thêm phụ tùng vào danh sách
        VehiclePartEntity vehiclePart = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(creationServiceTypeVehiclePartRequest.getVehiclePartId());
        if(vehiclePart == null) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }
        VehicleTypeEntity vehicleTypeOfVehiclePart = vehiclePart.getVehicleType();
        VehicleTypeEntity vehicleTypeOfServiceType = serviceTypeEntity.getVehicleTypeEntity();

            // Kiểm tra phụ tùng với loại dịch vụ có match với loại xe không
         if(!Objects.equals(vehicleTypeOfVehiclePart.getVehicleTypeId(), vehicleTypeOfServiceType.getVehicleTypeId())){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_CHOSEN_VEHICLE_PART_NOT_SUITABLE + creationServiceTypeVehiclePartRequest.getVehiclePartId());
            throw new EntityValidationException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_CHOSEN_VEHICLE_PART_NOT_SUITABLE);
        }
        serviceTypeVehiclePartEntity.setVehiclePart(vehiclePart);

        //Kiểm tra số lượng phụ tùng đủ để cung cấp không
        validQuantityForAppointment(creationServiceTypeVehiclePartRequest.getRequiredQuantity(), vehiclePart);
        serviceTypeVehiclePartEntity.setRequiredQuantity(creationServiceTypeVehiclePartRequest.getRequiredQuantity());

        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_CREATING_SERVICE_TYPE_VEHICLE_PART);
        serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateServiceTypeVehiclePart(UUID id, UpdationServiceTypeVehiclePartRequest updationServiceTypeVehiclePartRequest) {
        ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity = serviceTypeVehiclePartRepository.findByServiceTypeVehiclePartIdAndIsDeletedFalse(id);
        if(serviceTypeVehiclePartEntity == null){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND);
        }

        // Thêm dịch vụ vào danh sách
        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(updationServiceTypeVehiclePartRequest.getServiceTypeId());
        if(serviceTypeEntity == null){
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);

            //Kiểm tra chỉ nhận dịch vụ con
        } else if(serviceTypeEntity.getParentId() == null){
            log.warn(ServiceTypeConstants.LOG_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE + updationServiceTypeVehiclePartRequest.getServiceTypeId());
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_MUST_CHOOSING_SPECIFIC_SERVICE_TYPE);
        }
        serviceTypeVehiclePartEntity.setServiceType(serviceTypeEntity);

        //Thêm phụ tùng vào danh sách
        VehiclePartEntity vehiclePart = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(updationServiceTypeVehiclePartRequest.getVehiclePartId());
        if(vehiclePart == null) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        VehicleTypeEntity vehicleTypeOfVehiclePart = vehiclePart.getVehicleType();
        VehicleTypeEntity vehicleTypeOfServiceType = serviceTypeEntity.getVehicleTypeEntity();

            // Kiểm tra phụ tùng với loại dịch vụ có match với loại xe không
         if(!Objects.equals(vehicleTypeOfVehiclePart.getVehicleTypeId(), vehicleTypeOfServiceType.getVehicleTypeId())){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_CHOSEN_VEHICLE_PART_NOT_SUITABLE + updationServiceTypeVehiclePartRequest.getVehiclePartId());
            throw new EntityValidationException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_CHOSEN_VEHICLE_PART_NOT_SUITABLE);
        }
        serviceTypeVehiclePartEntity.setVehiclePart(vehiclePart);

        //Kiểm tra số lượng phụ tùng đủ để cung cấp không
        validQuantityForAppointment(updationServiceTypeVehiclePartRequest.getRequiredQuantity(), vehiclePart);
        serviceTypeVehiclePartEntity.setRequiredQuantity(updationServiceTypeVehiclePartRequest.getRequiredQuantity());

        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_UPDATING_SERVICE_TYPE_VEHICLE_PART + id);
        serviceTypeVehiclePartMapper.toUpdate(serviceTypeVehiclePartEntity, updationServiceTypeVehiclePartRequest);
        serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
        return true;
    }

    @Override
    public boolean deleteServiceTypeVehiclePart(UUID id) {
        ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity = serviceTypeVehiclePartRepository.findByServiceTypeVehiclePartIdAndIsDeletedFalse(id);
        if(serviceTypeVehiclePartEntity == null){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND);
        }
        //Kiểm tra có cuộc hẹn nào đang sử dụng dịch vụ - phụ tùng đó không
        if(!serviceTypeVehiclePartEntity.getAppointments().isEmpty()){
            existActiveAppointment(id);

            // Nếu có, chỉnh lại trạng thái toàn bộ cuộc hẹn sử dụng dịch vụ - phụ tùng này
            List<AppointmentEntity> appointmentEntities = appointmentRepository.getUnactiveAppointmentListInServiceTypeVehiclePartId(id);
            if(!appointmentEntities.isEmpty()){
                appointmentEntities.forEach(appointmentEntity -> appointmentEntity.setStatus(AppointmentStatusEnum.CANCELLED));
            }
        }

        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_DELETING_SERVICE_TYPE_VEHICLE_PART + id);
        serviceTypeVehiclePartEntity.setIsDeleted(true);
        serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
        return true;
    }

    @Override
    public boolean restoreServiceTypeVehiclePart(UUID id){
        ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity = serviceTypeVehiclePartRepository.findByServiceTypeVehiclePartIdAndIsDeletedTrue(id);
        if(serviceTypeVehiclePartEntity == null){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND);
        }

        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_RESTORING_SERVICE_TYPE_VEHICLE_PART + id);
        serviceTypeVehiclePartEntity.setIsDeleted(false);
        serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
        return true;
    }

    private void validQuantityForAppointment(Integer quantity, VehiclePartEntity vehiclePart){
        if(vehiclePart.getCurrentQuantity() < quantity){
            log.warn(VehiclePartConstants.LOG_ERR_QUANTITY_NOT_ENOUGH + vehiclePart.getCurrentQuantity());
            throw new EntityValidationException(VehiclePartConstants.MESSAGE_ERR_QUANTITY_NOT_ENOUGH);
        }
    }

    private void existActiveAppointment(UUID serviceTypeVehiclePartId) {
        boolean existedActiveAppointment = serviceTypeVehiclePartRepository.existsActiveAppointmentsInServiceTypeVehiclePartId(serviceTypeVehiclePartId);
        if(existedActiveAppointment){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_APPOINTMENT_IS_USING_THIS_STVP);
            throw new EntityValidationException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_APPOINTMENT_IS_USING_THIS_STVP);
        }
    }

    public void checkDependOnAppointmentByServiceTypeId(UUID serviceTypeId){
        boolean existedActiveAppointmentByServiceTypeId = serviceTypeVehiclePartRepository.existsActiveAppointmentsInServiceTypeVehiclePartByServiceTypeId(serviceTypeId);
        if(existedActiveAppointmentByServiceTypeId){
            log.warn(ServiceTypeConstants.LOG_ERR_CAN_NOT_DELETE_SERVICE_TYPE + serviceTypeId);
            throw new EntityValidationException(ServiceTypeConstants.MESSAGE_ERR_CAN_NOT_DELETE_SERVICE_TYPE);
        }
    }

    public void checkDependOnAppointmentByVehiclePartId(UUID vehiclePartId){
        boolean existedActiveAppointmentByVehiclePartId = serviceTypeVehiclePartRepository.existsActiveAppointmentsInServiceTypeVehiclePartByVehiclePartId(vehiclePartId);
        if(existedActiveAppointmentByVehiclePartId){
            log.warn(VehiclePartConstants.LOG_ERR_CAN_NOT_DELETE_VEHICLE_PART + vehiclePartId);
            throw new EntityValidationException(VehiclePartConstants.MESSAGE_ERR_CAN_NOT_DELETE_VEHICLE_PART);
        }
    }

}
