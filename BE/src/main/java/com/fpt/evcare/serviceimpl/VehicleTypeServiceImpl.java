package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.VehicleTypeConstants;
import com.fpt.evcare.dto.request.vehicle_type.CreationVehicleTypeRequest;
import com.fpt.evcare.dto.request.vehicle_type.UpdationVehicleTypeRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehicleTypeResponse;
import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.VehicleTypeValidationException;
import com.fpt.evcare.mapper.VehicleTypeMapper;
import com.fpt.evcare.repository.VehicleTypeRepository;
import com.fpt.evcare.service.VehicleTypeService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class VehicleTypeServiceImpl implements VehicleTypeService {

    VehicleTypeRepository vehicleTypeRepository;
    VehicleTypeMapper vehicleTypeMapper;

    @Override
    public VehicleTypeResponse getVehicleTypeById(UUID uuid) {
        VehicleTypeEntity vehicleTypeEntity = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(uuid);
        if(vehicleTypeEntity == null){
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }

        log.info(VehicleTypeConstants.LOG_SUCCESS_SHOWING_VEHICLE_TYPE);
        return vehicleTypeMapper.toResponse(vehicleTypeEntity);
    }

    @Override
    public PageResponse<VehicleTypeResponse> searchVehicleTypes(String keyword, Pageable pageable) {
        Page<VehicleTypeEntity> vehicleTypeEntityPage;

        if(keyword == null){
            vehicleTypeEntityPage = vehicleTypeRepository.findAllByIsDeletedFalse(pageable);
        } else {
            vehicleTypeEntityPage = vehicleTypeRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(pageable, keyword);
        }

        if(vehicleTypeEntityPage.isEmpty()){
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_LIST_NOT_FOUND);
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_LIST_NOT_FOUND);
        }

        List<VehicleTypeResponse> vehicleTypeResponses = vehicleTypeEntityPage
                .map(vehicleTypeMapper :: toResponse)
                .getContent();

        log.info(VehicleTypeConstants.LOG_SUCCESS_SHOWING_VEHICLE_TYPE_LIST);
        return PageResponse.<VehicleTypeResponse>builder()
                .data(vehicleTypeResponses)
                .page(vehicleTypeEntityPage.getNumber())
                .totalElements(vehicleTypeEntityPage.getTotalElements())
                .totalPages(vehicleTypeEntityPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public boolean addVehicleType(CreationVehicleTypeRequest creationVehicleTypeRequest) {
        checkVehicleTypeExist(creationVehicleTypeRequest.getVehicleTypeName());
        VehicleTypeEntity vehicleType = vehicleTypeMapper.toEntity(creationVehicleTypeRequest);

        vehicleType.setSearch(creationVehicleTypeRequest.getVehicleTypeName());

        log.info(VehicleTypeConstants.LOG_SUCCESS_CREATING_VEHICLE_TYPE);
        vehicleTypeRepository.save(vehicleType);
        return true;
    }

    @Override
    @Transactional
    public boolean updateVehicleType(UUID id, UpdationVehicleTypeRequest updationVehicleTypeRequest) {
        VehicleTypeEntity vehicleType = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(id);

        if(vehicleType == null){
            log.warn(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
            throw new VehicleTypeValidationException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }

        if(Objects.equals(vehicleType.getVehicleTypeName(), updationVehicleTypeRequest.getVehicleTypeName())){
            vehicleType.setVehicleTypeName(updationVehicleTypeRequest.getVehicleTypeName());
        } else {
            checkVehicleTypeExist(updationVehicleTypeRequest.getVehicleTypeName());
            vehicleType.setVehicleTypeName(updationVehicleTypeRequest.getVehicleTypeName());
        }

        vehicleTypeMapper.toUpdate(vehicleType, updationVehicleTypeRequest);
        vehicleTypeRepository.save(vehicleType);
        return true;
    }

    @Override
    public boolean deleteVehicleType(UUID id) {
        VehicleTypeEntity existedVehicleType = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(id);
        if(existedVehicleType == null){
            log.warn(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }
        existedVehicleType.setIsDeleted(true);

        log.info(VehicleTypeConstants.LOG_SUCCESS_DELETING_VEHICLE_TYPE);
        vehicleTypeRepository.save(existedVehicleType);
        return true;
    }

    @Override
    public boolean restoreVehicleType(UUID id) {
        VehicleTypeEntity existedVehicleType = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedTrue(id);
        if(existedVehicleType == null){
            log.warn(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }
        existedVehicleType.setIsDeleted(false);

        log.info(VehicleTypeConstants.LOG_SUCCESS_RESTORING_VEHICLE_TYPE);
        vehicleTypeRepository.save(existedVehicleType);
        return true;
    }

    private void checkVehicleTypeExist(String name){
        boolean duplicatedTypeName = vehicleTypeRepository.existsVehiclePartByVehicleTypeNameLikeIgnoreCaseAndIsDeletedFalse(name);
        if(duplicatedTypeName){
            log.warn(VehicleTypeConstants.LOG_ERR_DUPLICATED_VEHICLE_TYPE_NAME);
            throw new VehicleTypeValidationException(VehicleTypeConstants.MESSAGE_ERR_DUPLICATED_VEHICLE_TYPE_NAME);
        }
    }
}
