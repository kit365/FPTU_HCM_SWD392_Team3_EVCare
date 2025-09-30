package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.VehiclePartCategoryConstant;
import com.fpt.evcare.dto.request.vehicle_part_category.CreationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.request.vehicle_part_category.UpdationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.response.VehiclePartCategoryResponse;
import com.fpt.evcare.entity.VehiclePartCategoryEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.UserValidationException;
import com.fpt.evcare.exception.VehiclePartCategoryException;
import com.fpt.evcare.mapper.VehiclePartCategoryMapper;
import com.fpt.evcare.repository.VehiclePartCategoryRepository;
import com.fpt.evcare.service.VehiclePartCategoryService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VehiclePartCategoryServiceImpl implements VehiclePartCategoryService {

    VehiclePartCategoryRepository vehiclePartCategoryRepository;
    VehiclePartCategoryMapper vehiclePartCategoryMapper;

    @Override
    public VehiclePartCategoryResponse getVehiclePartCategoryById(UUID id) {
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryRepository.findByVehiclePartCategoryIdAndIsDeletedFalse(id);

        if(vehiclePartCategoryEntity == null) {
            log.warn(VehiclePartCategoryConstant.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstant.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        }

        log.info(VehiclePartCategoryConstant.LOG_INFO_SHOWING_VEHICLE_PART_CATEGORY, id);
        return vehiclePartCategoryMapper.toResponse(vehiclePartCategoryEntity);
    }

    @Override
    public List<VehiclePartCategoryResponse> getAllVehiclePartCategory() {
        List<VehiclePartCategoryEntity> vehiclePartCategoryEntities = vehiclePartCategoryRepository.findAllByIsDeletedFalse();
        if (vehiclePartCategoryEntities.isEmpty()) {
            log.warn(VehiclePartCategoryConstant.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstant.MESSAGE_ERR_VEHICLE_PART_CATEGORY_LIST_NOT_FOUND);
        }

        log.info(VehiclePartCategoryConstant.LOG_INFO_SHOWING_VEHICLE_PART_CATEGORY_LIST);
        return vehiclePartCategoryMapper.toResponseList(vehiclePartCategoryEntities);
    }

    @Override
    public List<VehiclePartCategoryResponse> seacrchVehiclePartCategory(String keyword) {
        List<VehiclePartCategoryEntity> vehiclePartCategoryEntities = vehiclePartCategoryRepository.findBySearchContainingIgnoreCase(keyword);
        if (vehiclePartCategoryEntities.isEmpty()) {
            log.warn(VehiclePartCategoryConstant.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstant.MESSAGE_ERR_VEHICLE_PART_CATEGORY_LIST_NOT_FOUND);
        }

        log.info(VehiclePartCategoryConstant.LOG_INFO_SHOWING_VEHICLE_PART_CATEGORY_LIST, keyword);
        return vehiclePartCategoryMapper.toResponseList(vehiclePartCategoryEntities);
    }

    @Override
    @Transactional
    public boolean createVehiclePartCategory(CreationVehiclePartCategoryRequest creationVehiclePartCategoryRequest) {
        checkDuplicatePartCategoryName(creationVehiclePartCategoryRequest.getPartCategoryName());
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryMapper.toEntity(creationVehiclePartCategoryRequest);

        vehiclePartCategoryEntity.setPartCategoryName(vehiclePartCategoryEntity.getPartCategoryName());
        vehiclePartCategoryEntity.setSearch(creationVehiclePartCategoryRequest.getPartCategoryName());

        log.info(VehiclePartCategoryConstant.LOG_INFO_CREATING_VEHICLE_PART_CATEGORY, creationVehiclePartCategoryRequest.getPartCategoryName());
        vehiclePartCategoryRepository.save(vehiclePartCategoryEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateVehiclePartCategory(UUID id, UpdationVehiclePartCategoryRequest updationVehiclePartCategoryRequest) {
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryRepository.findByVehiclePartCategoryIdAndIsDeletedFalse(id);

        if(vehiclePartCategoryEntity == null) {
            log.warn(VehiclePartCategoryConstant.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstant.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        }

        if (Objects.equals(updationVehiclePartCategoryRequest.getPartCategoryName(), vehiclePartCategoryEntity.getPartCategoryName())) {
            vehiclePartCategoryEntity.setPartCategoryName(updationVehiclePartCategoryRequest.getPartCategoryName());
        } else {
            if (vehiclePartCategoryRepository.existsByPartCategoryName(updationVehiclePartCategoryRequest.getPartCategoryName()))
                throw new UserValidationException(VehiclePartCategoryConstant.MESSAGE_ERR_DUPLICATED_VEHICLE_PART_CATEGORY);
            vehiclePartCategoryEntity.setPartCategoryName(updationVehiclePartCategoryRequest.getPartCategoryName());
        }

        vehiclePartCategoryMapper.toUpdate(updationVehiclePartCategoryRequest, vehiclePartCategoryEntity);

        vehiclePartCategoryEntity.setPartCategoryName(updationVehiclePartCategoryRequest.getPartCategoryName());
        vehiclePartCategoryEntity.setSearch(updationVehiclePartCategoryRequest.getPartCategoryName());

        log.info(VehiclePartCategoryConstant.LOG_INFO_UPDATING_VEHICLE_PART_CATEGORY, id);
        vehiclePartCategoryRepository.save(vehiclePartCategoryEntity);
        return true;
    }

    @Override
    public boolean deleteVehiclePartCategory(UUID id) {
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryRepository.findByVehiclePartCategoryIdAndIsDeletedFalse(id);

        if(vehiclePartCategoryEntity == null) {
            log.warn(VehiclePartCategoryConstant.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstant.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        }

        vehiclePartCategoryEntity.setIsDeleted(true);

        if(!log.isErrorEnabled()) {
            log.info(VehiclePartCategoryConstant.LOG_INFO_DELETING_VEHICLE_PART_CATEGORY, id);
        }
        vehiclePartCategoryRepository.save(vehiclePartCategoryEntity);
        return true;
    }

    @Override
    public boolean restoreVehiclePartCategory(UUID id) {
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryRepository.findByVehiclePartCategoryIdAndIsDeletedFalse(id);

        if(vehiclePartCategoryEntity == null) {
            log.warn(VehiclePartCategoryConstant.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstant.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        }

        vehiclePartCategoryEntity.setIsDeleted(false);

        log.info(VehiclePartCategoryConstant.LOG_INFO_RESTORING_VEHICLE_PART_CATEGORY, id);
        vehiclePartCategoryRepository.save(vehiclePartCategoryEntity);
        return true;
    }

    private void checkDuplicatePartCategoryName(String partCategoryName) {
            if (vehiclePartCategoryRepository.existsByPartCategoryNameAndIsDeletedFalse(partCategoryName)) {
                log.warn(VehiclePartCategoryConstant.LOG_ERR_DUPLICATED_VEHICLE_PART_CATEGORY, partCategoryName);
                throw new VehiclePartCategoryException(VehiclePartCategoryConstant.MESSAGE_ERR_DUPLICATED_VEHICLE_PART_CATEGORY);
            }
    }
}
