package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.VehiclePartCategoryConstants;
import com.fpt.evcare.dto.request.vehicle_part_category.CreationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.request.vehicle_part_category.UpdationVehiclePartCategoryRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehiclePartCategoryResponse;
import com.fpt.evcare.entity.VehiclePartCategoryEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.VehiclePartCategoryException;
import com.fpt.evcare.mapper.VehiclePartCategoryMapper;
import com.fpt.evcare.repository.VehiclePartCategoryRepository;
import com.fpt.evcare.service.VehiclePartCategoryService;
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
import java.util.stream.Collectors;

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
            log.warn(VehiclePartCategoryConstants.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstants.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        }

        log.info(VehiclePartCategoryConstants.LOG_INFO_SHOWING_VEHICLE_PART_CATEGORY, id);
        return vehiclePartCategoryMapper.toResponse(vehiclePartCategoryEntity);
    }

    @Override
    public List<VehiclePartCategoryResponse> getvehiclePartCategoryResponseList(){
        List<VehiclePartCategoryEntity> vehiclePartCategoryEntities = vehiclePartCategoryRepository.findAllByIsDeletedFalse();
        if(vehiclePartCategoryEntities == null) {
            log.warn(VehiclePartCategoryConstants.LOG_ERR_VEHICLE_PART_CATEGORY_LIST_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstants.MESSAGE_ERR_VEHICLE_PART_CATEGORY_LIST_NOT_FOUND);
        }
        return vehiclePartCategoryEntities.stream().map(vehiclePartCategoryEntity -> {
            VehiclePartCategoryResponse vehiclePartCategoryResponse = new VehiclePartCategoryResponse();
            vehiclePartCategoryResponse.setVehiclePartCategoryId(vehiclePartCategoryEntity.getVehiclePartCategoryId());
            vehiclePartCategoryResponse.setPartCategoryName(vehiclePartCategoryEntity.getPartCategoryName());

            return vehiclePartCategoryResponse;
        }).collect(Collectors.toList());
    }

    @Override
    public PageResponse<VehiclePartCategoryResponse> seacrchVehiclePartCategory(String keyword, Pageable pageable) {
        Page<VehiclePartCategoryEntity> vehiclePartCategoryEntityPage;
        if(keyword == null) {
            vehiclePartCategoryEntityPage = vehiclePartCategoryRepository.findAllByIsDeletedFalse(pageable);
        } else {
            vehiclePartCategoryEntityPage = vehiclePartCategoryRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }

        if (vehiclePartCategoryEntityPage.isEmpty()) {
            log.warn(VehiclePartCategoryConstants.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstants.MESSAGE_ERR_VEHICLE_PART_CATEGORY_LIST_NOT_FOUND);
        }

        List<VehiclePartCategoryResponse> vehiclePartCategoryResponseList = vehiclePartCategoryEntityPage
                .map(vehiclePartCategoryMapper :: toResponse)
                .getContent();


        log.info(VehiclePartCategoryConstants.LOG_INFO_SHOWING_VEHICLE_PART_CATEGORY_LIST, keyword);
        return PageResponse.<VehiclePartCategoryResponse>builder()
                .data(vehiclePartCategoryResponseList)
                .page(vehiclePartCategoryEntityPage.getNumber())
                .totalElements(vehiclePartCategoryEntityPage.getTotalElements())
                .totalPages(vehiclePartCategoryEntityPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public boolean createVehiclePartCategory(CreationVehiclePartCategoryRequest creationVehiclePartCategoryRequest) {
        checkDuplicatePartCategoryName(creationVehiclePartCategoryRequest.getPartCategoryName());
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryMapper.toEntity(creationVehiclePartCategoryRequest);

        vehiclePartCategoryEntity.setSearch(creationVehiclePartCategoryRequest.getPartCategoryName());

        log.info(VehiclePartCategoryConstants.LOG_INFO_CREATING_VEHICLE_PART_CATEGORY, creationVehiclePartCategoryRequest.getPartCategoryName());
        vehiclePartCategoryRepository.save(vehiclePartCategoryEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean updateVehiclePartCategory(UUID id, UpdationVehiclePartCategoryRequest updationVehiclePartCategoryRequest) {
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryRepository.findByVehiclePartCategoryIdAndIsDeletedFalse(id);

        if(vehiclePartCategoryEntity == null) {
            log.warn(VehiclePartCategoryConstants.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstants.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        }

        if (Objects.equals(updationVehiclePartCategoryRequest.getPartCategoryName(), vehiclePartCategoryEntity.getPartCategoryName())) {
            vehiclePartCategoryEntity.setPartCategoryName(updationVehiclePartCategoryRequest.getPartCategoryName());
        } else {
            checkDuplicatePartCategoryName(updationVehiclePartCategoryRequest.getPartCategoryName());
            vehiclePartCategoryEntity.setPartCategoryName(updationVehiclePartCategoryRequest.getPartCategoryName());
        }

        vehiclePartCategoryMapper.toUpdate(updationVehiclePartCategoryRequest, vehiclePartCategoryEntity);

        vehiclePartCategoryEntity.setSearch(updationVehiclePartCategoryRequest.getPartCategoryName());

        log.info(VehiclePartCategoryConstants.LOG_INFO_UPDATING_VEHICLE_PART_CATEGORY, id);
        vehiclePartCategoryRepository.save(vehiclePartCategoryEntity);
        return true;
    }

    @Override
    public boolean deleteVehiclePartCategory(UUID id) {
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryRepository.findByVehiclePartCategoryIdAndIsDeletedFalse(id);

        if(vehiclePartCategoryEntity == null) {
            log.warn(VehiclePartCategoryConstants.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstants.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        }

        vehiclePartCategoryEntity.setIsDeleted(true);

        if(!log.isErrorEnabled()) {
            log.info(VehiclePartCategoryConstants.LOG_INFO_DELETING_VEHICLE_PART_CATEGORY, id);
        }
        vehiclePartCategoryRepository.save(vehiclePartCategoryEntity);
        return true;
    }

    @Override
    public boolean restoreVehiclePartCategory(UUID id) {
        VehiclePartCategoryEntity vehiclePartCategoryEntity = vehiclePartCategoryRepository.findById(id).orElseThrow(() -> {
            log.warn(VehiclePartCategoryConstants.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
            throw new ResourceNotFoundException(VehiclePartCategoryConstants.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        });

        vehiclePartCategoryEntity.setIsDeleted(false);

        log.info(VehiclePartCategoryConstants.LOG_INFO_RESTORING_VEHICLE_PART_CATEGORY, id);
        vehiclePartCategoryRepository.save(vehiclePartCategoryEntity);
        return true;
    }

    private void checkDuplicatePartCategoryName(String partCategoryName) {
            if (vehiclePartCategoryRepository.existsByPartCategoryNameAndIsDeletedFalse(partCategoryName)) {
                log.warn(VehiclePartCategoryConstants.LOG_ERR_DUPLICATED_VEHICLE_PART_CATEGORY, partCategoryName);
                throw new VehiclePartCategoryException(VehiclePartCategoryConstants.MESSAGE_ERR_DUPLICATED_VEHICLE_PART_CATEGORY);
            }
    }
}
