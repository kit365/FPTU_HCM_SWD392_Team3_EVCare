package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.ServiceTypeConstants;
import com.fpt.evcare.constants.ServiceTypeVehiclePartConstants;
import com.fpt.evcare.constants.VehiclePartConstants;
import com.fpt.evcare.dto.request.service_type_vehicle_part.CreationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.request.service_type_vehicle_part.UpdationServiceTypeVehiclePartRequest;
import com.fpt.evcare.dto.response.ServiceTypeResponse;
import com.fpt.evcare.dto.response.ServiceTypeVehiclePartResponse;
import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.entity.ServiceTypeVehiclePartEntity;
import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.ServiceTypeVehiclePartMapper;
import com.fpt.evcare.repository.ServiceTypeRepository;
import com.fpt.evcare.repository.ServiceTypeVehiclePartRepository;
import com.fpt.evcare.repository.VehiclePartRepository;
import com.fpt.evcare.service.ServiceTypeVehiclePartService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
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

    @Override
    public List<ServiceTypeVehiclePartResponse> getVehiclePartByServiceTypeId(UUID id) {
        List<ServiceTypeVehiclePartEntity> serviceTypeVehiclePartEntityList = serviceTypeVehiclePartRepository.findAllByServiceTypeServiceTypeIdAndIsDeletedFalse(id);
        if(serviceTypeVehiclePartEntityList == null){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND);
        }

        List<ServiceTypeVehiclePartResponse> responseList = serviceTypeVehiclePartEntityList.stream().map(serviceTypeVehiclePartEntity -> {
            ServiceTypeVehiclePartResponse serviceTypeVehiclePartResponse = serviceTypeVehiclePartMapper.toResponse(serviceTypeVehiclePartEntity);

            ServiceTypeEntity serviceType = serviceTypeVehiclePartEntity.getServiceType();
            ServiceTypeResponse serviceTypeResponse = new ServiceTypeResponse();
            if(serviceType != null && serviceType.getParent() != null){
                serviceTypeResponse.setServiceTypeId(serviceType.getServiceTypeId());
                serviceTypeResponse.setServiceName(serviceType.getServiceName());
                serviceTypeVehiclePartResponse.setServiceType(serviceTypeResponse);
            }
            serviceTypeVehiclePartResponse.setServiceType(serviceTypeResponse);

            return serviceTypeVehiclePartResponse;

        }).toList();

        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_SHOWING_SERVICE_TYPE_VEHICLE_PART + id);
        return responseList;
    }

    @Override
    public boolean createServiceTypeVehiclePart(CreationServiceTypeVehiclePartRequest creationServiceTypeVehiclePartRequest) {
        ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity = serviceTypeVehiclePartMapper.toEntity(creationServiceTypeVehiclePartRequest);

        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(serviceTypeVehiclePartEntity.getServiceType().getServiceTypeId());
        if(serviceTypeEntity == null){
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }
        serviceTypeVehiclePartEntity.setServiceType(serviceTypeEntity);

        VehiclePartEntity vehiclePart = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(serviceTypeVehiclePartEntity.getVehiclePart().getVehiclePartId());
        if(vehiclePart == null){
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }
        serviceTypeVehiclePartEntity.setVehiclePart(vehiclePart);

        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_CREATING_SERVICE_TYPE_VEHICLE_PART);
        serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
        return true;
    }

    @Override
    public boolean updateServiceTypeVehiclePart(UUID id, UpdationServiceTypeVehiclePartRequest updationServiceTypeVehiclePartRequest) {
        ServiceTypeVehiclePartEntity serviceTypeVehiclePartEntity = serviceTypeVehiclePartRepository.findByServiceTypeVehiclePartIdAndIsDeletedFalse(id);
        if(serviceTypeVehiclePartEntity == null){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND);
        }

        ServiceTypeEntity serviceTypeEntity = serviceTypeRepository.findByServiceTypeIdAndIsDeletedFalse(serviceTypeVehiclePartEntity.getServiceType().getServiceTypeId());
        if(serviceTypeEntity == null){
            log.warn(ServiceTypeConstants.LOG_ERR_SERVICE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(ServiceTypeConstants.MESSAGE_ERR_SERVICE_TYPE_NOT_FOUND);
        }
        serviceTypeVehiclePartEntity.setServiceType(serviceTypeEntity);

        VehiclePartEntity vehiclePart = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(serviceTypeVehiclePartEntity.getVehiclePart().getVehiclePartId());
        if(vehiclePart == null){
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }
        serviceTypeVehiclePartEntity.setVehiclePart(vehiclePart);

        log.info(ServiceTypeVehiclePartConstants.LOG_INFO_UPDATING_SERVICE_TYPE_VEHICLE_PART + id);
        serviceTypeVehiclePartMapper.toUpdate(serviceTypeVehiclePartEntity, updationServiceTypeVehiclePartRequest);
        serviceTypeVehiclePartRepository.save(serviceTypeVehiclePartEntity);
        return true;
    }

    @Override
    public boolean deleteServiceTypeVehiclePart(UUID id) {
        if(serviceTypeVehiclePartRepository.existsByServiceTypeVehiclePartIdAndIsDeletedFalse(id)){
            log.warn(ServiceTypeVehiclePartConstants.LOG_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(ServiceTypeVehiclePartConstants.MESSAGE_ERR_SERVICE_TYPE_VEHICLE_PART_NOT_FOUND);
        }

        log.warn(ServiceTypeVehiclePartConstants.LOG_INFO_DELETING_SERVICE_TYPE_VEHICLE_PART + id);
        serviceTypeVehiclePartRepository.deleteById(id);
        return false;
    }
}
