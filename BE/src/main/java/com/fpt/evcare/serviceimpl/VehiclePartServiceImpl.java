package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.*;
import com.fpt.evcare.dto.request.vehicle_part.CreationVehiclePartRequest;
import com.fpt.evcare.dto.request.vehicle_part.UpdationVehiclePartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehiclePartCategoryResponse;
import com.fpt.evcare.dto.response.VehiclePartResponse;
import com.fpt.evcare.dto.response.VehicleTypeResponse;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.VehiclePartStatusEnum;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.VehiclePartValidationException;
import com.fpt.evcare.mapper.VehiclePartCategoryMapper;
import com.fpt.evcare.mapper.VehiclePartMapper;
import com.fpt.evcare.mapper.VehicleTypeMapper;
import com.fpt.evcare.repository.*;
import com.fpt.evcare.service.AppointmentService;
import com.fpt.evcare.service.ServiceTypeVehiclePartService;
import com.fpt.evcare.service.VehiclePartService;
import com.fpt.evcare.utils.UtilFunction;
import jdk.jshell.execution.Util;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VehiclePartServiceImpl implements VehiclePartService {

    VehicleTypeRepository vehicleTypeRepository;
    VehicleTypeMapper vehicleTypeMapper;
    VehiclePartRepository vehiclePartRepository;
    VehiclePartMapper vehiclePartMapper;
    VehiclePartCategoryRepository vehiclePartCategoryRepository;
    VehiclePartCategoryMapper vehiclePartCategoryMapper;
    ServiceTypeVehiclePartRepository serviceTypeVehiclePartRepository;

    @Override
    public VehiclePartResponse getVehiclePart(UUID vehiclePartId) {
        VehiclePartEntity vehiclePartEntity = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(vehiclePartId);
        if (vehiclePartEntity == null) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + vehiclePartId);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        VehiclePartResponse vehiclePartResponse = vehiclePartMapper.toResponse(vehiclePartEntity);

        if(vehiclePartEntity.getVehicleType() != null) {
            VehicleTypeResponse vehicleTypeResponse = vehicleTypeMapper.toResponse(vehiclePartEntity.getVehicleType());
            VehicleTypeResponse parsedVehicleTypeResponse = new VehicleTypeResponse();

            parsedVehicleTypeResponse.setVehicleTypeId(vehicleTypeResponse.getVehicleTypeId());
            parsedVehicleTypeResponse.setVehicleTypeName(vehicleTypeResponse.getVehicleTypeName());

            vehiclePartResponse.setVehicleType(parsedVehicleTypeResponse);
        } else {
            vehiclePartResponse.setVehicleType(null);
        }

        if(vehiclePartEntity.getVehiclePartCategories() != null) {
            VehiclePartCategoryResponse vehiclePartCategoryResponse = vehiclePartCategoryMapper.toResponse(vehiclePartEntity.getVehiclePartCategories());
            VehiclePartCategoryResponse parsedVehiclePartCategoryResponse = new VehiclePartCategoryResponse();

            parsedVehiclePartCategoryResponse.setVehiclePartCategoryId(vehiclePartCategoryResponse.getVehiclePartCategoryId());
            parsedVehiclePartCategoryResponse.setPartCategoryName(vehiclePartCategoryResponse.getPartCategoryName());

            vehiclePartResponse.setVehiclePartCategory(parsedVehiclePartCategoryResponse);
        } else {
            vehiclePartResponse.setVehiclePartCategory(null);
        }

        log.info(VehiclePartConstants.LOG_INFO_SHOWING_VEHICLE_PART + vehiclePartId);
        return vehiclePartResponse;
    }

    @Override
    public List<String> getAllVehiclePartStatuses() {
        return Arrays.stream(VehiclePartStatusEnum.values())
                .map(Enum::name) // Lấy tên của từng enum
                .collect(Collectors.toList());
    }

    @Override
    public List<VehiclePartResponse> getAllVehiclePartsByVehicleTypeId(UUID vehicleTypeId){
        VehicleTypeEntity vehicleTypeEntity = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(vehicleTypeId);
        if (vehicleTypeEntity == null) {
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_NOT_FOUND + vehicleTypeId);
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        }

        List<VehiclePartEntity> vehiclePartEntityList = vehiclePartRepository.findByVehicleTypeVehicleTypeIdAndIsDeletedFalse(vehicleTypeId);

        return vehiclePartEntityList.stream().map(vehiclePartEntity -> {
            VehiclePartResponse vehiclePartResponse = new VehiclePartResponse();
            vehiclePartResponse.setVehiclePartId(vehiclePartEntity.getVehiclePartId());
            vehiclePartResponse.setVehiclePartName(vehiclePartEntity.getVehiclePartName());

            VehiclePartCategoryResponse vehiclePartCategoryResponse = new VehiclePartCategoryResponse();
            vehiclePartCategoryResponse.setPartCategoryName(vehiclePartEntity.getVehiclePartCategories().getPartCategoryName());
            vehiclePartResponse.setVehiclePartCategory(vehiclePartCategoryResponse);
            return vehiclePartResponse;
        }).collect(Collectors.toList());
    }

    @Override
    public PageResponse<VehiclePartResponse> searchVehiclePart(String keyword, Pageable pageable) {
        Page<VehiclePartEntity> vehiclePartEntityPage;

        if(keyword == null || keyword.isEmpty()) {
            vehiclePartEntityPage = vehiclePartRepository.findAllByIsDeletedFalse(pageable);
        } else {
            vehiclePartEntityPage = vehiclePartRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }

        if(vehiclePartEntityPage == null || vehiclePartEntityPage.getTotalElements() == 0) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_LIST_NOT_FOUND + keyword);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_LIST_NOT_FOUND);
        }

        List<VehiclePartResponse> vehiclePartEntityList = vehiclePartEntityPage.map(vehiclePartEntity -> {
            VehiclePartResponse vehiclePartResponse = vehiclePartMapper.toResponse(vehiclePartEntity);

            if(vehiclePartEntity.getVehicleType() != null) {
                VehicleTypeResponse vehicleTypeResponse = vehicleTypeMapper.toResponse(vehiclePartEntity.getVehicleType());
                VehicleTypeResponse parsedVehicleTypeResponse = new VehicleTypeResponse();

                parsedVehicleTypeResponse.setVehicleTypeId(vehicleTypeResponse.getVehicleTypeId());
                parsedVehicleTypeResponse.setVehicleTypeName(vehicleTypeResponse.getVehicleTypeName());

                vehiclePartResponse.setVehicleType(parsedVehicleTypeResponse);
            } else {
                vehiclePartResponse.setVehicleType(null);
            }

            if(vehiclePartEntity.getVehiclePartCategories() != null) {
                VehiclePartCategoryResponse vehiclePartCategoryResponse = vehiclePartCategoryMapper.toResponse(vehiclePartEntity.getVehiclePartCategories());
                VehiclePartCategoryResponse parsedVehiclePartCategoryResponse = new VehiclePartCategoryResponse();

                parsedVehiclePartCategoryResponse.setVehiclePartCategoryId(vehiclePartCategoryResponse.getVehiclePartCategoryId());
                parsedVehiclePartCategoryResponse.setPartCategoryName(vehiclePartCategoryResponse.getPartCategoryName());

                vehiclePartResponse.setVehiclePartCategory(parsedVehiclePartCategoryResponse);
            } else {
                vehiclePartResponse.setVehiclePartCategory(null);
            }

            return vehiclePartResponse;
        }).getContent();

        log.info(VehiclePartConstants.LOG_INFO_SHOWING_VEHICLE_PART_LIST + keyword);
        return PageResponse.<VehiclePartResponse>builder()
                .data(vehiclePartEntityList)
                .page(vehiclePartEntityPage.getNumber())
                .totalElements(vehiclePartEntityPage.getTotalElements())
                .totalPages(vehiclePartEntityPage.getTotalPages())
                .build();
    }

    @Override
    public PageResponse<VehiclePartResponse> searchVehiclePartWithFilters(String keyword, String vehicleTypeId, 
                                                                          String categoryId, String status, 
                                                                          Boolean minStock, Pageable pageable) {
        Page<VehiclePartEntity> vehiclePartEntityPage = vehiclePartRepository.findVehiclePartsWithFilters(
                keyword, vehicleTypeId, categoryId, status, minStock, pageable);

        if(vehiclePartEntityPage == null || vehiclePartEntityPage.getTotalElements() == 0) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_LIST_NOT_FOUND + keyword);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_LIST_NOT_FOUND);
        }

        List<VehiclePartResponse> vehiclePartEntityList = vehiclePartEntityPage.map(vehiclePartEntity -> {
            VehiclePartResponse vehiclePartResponse = vehiclePartMapper.toResponse(vehiclePartEntity);

            if(vehiclePartEntity.getVehicleType() != null) {
                VehicleTypeResponse vehicleTypeResponse = vehicleTypeMapper.toResponse(vehiclePartEntity.getVehicleType());
                VehicleTypeResponse parsedVehicleTypeResponse = new VehicleTypeResponse();

                parsedVehicleTypeResponse.setVehicleTypeId(vehicleTypeResponse.getVehicleTypeId());
                parsedVehicleTypeResponse.setVehicleTypeName(vehicleTypeResponse.getVehicleTypeName());

                vehiclePartResponse.setVehicleType(parsedVehicleTypeResponse);
            } else {
                vehiclePartResponse.setVehicleType(null);
            }

            if(vehiclePartEntity.getVehiclePartCategories() != null) {
                VehiclePartCategoryResponse vehiclePartCategoryResponse = vehiclePartCategoryMapper.toResponse(vehiclePartEntity.getVehiclePartCategories());
                VehiclePartCategoryResponse parsedVehiclePartCategoryResponse = new VehiclePartCategoryResponse();

                parsedVehiclePartCategoryResponse.setVehiclePartCategoryId(vehiclePartCategoryResponse.getVehiclePartCategoryId());
                parsedVehiclePartCategoryResponse.setPartCategoryName(vehiclePartCategoryResponse.getPartCategoryName());

                vehiclePartResponse.setVehiclePartCategory(parsedVehiclePartCategoryResponse);
            } else {
                vehiclePartResponse.setVehiclePartCategory(null);
            }

            return vehiclePartResponse;
        }).getContent();

        log.info(VehiclePartConstants.LOG_INFO_SHOWING_VEHICLE_PART_LIST + keyword);
        return PageResponse.<VehiclePartResponse>builder()
                .data(vehiclePartEntityList)
                .page(vehiclePartEntityPage.getNumber())
                .totalElements(vehiclePartEntityPage.getTotalElements())
                .totalPages(vehiclePartEntityPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public boolean addVehiclePart(CreationVehiclePartRequest creationVehiclePartRequest) {
        checkDuplicatedPartName(creationVehiclePartRequest.getVehiclePartName());
        VehiclePartEntity vehiclePart = vehiclePartMapper.toEntity(creationVehiclePartRequest);

        VehicleTypeEntity vehicleType = vehicleTypeRepository.findByVehicleTypeIdAndIsDeletedFalse(creationVehiclePartRequest.getVehicleTypeId());
        if(vehicleType == null) {
            UUID vehicleTypeId = creationVehiclePartRequest.getVehicleTypeId();
            log.warn(VehicleTypeConstants.LOG_ERR_VEHICLE_TYPE_NOT_FOUND + vehicleTypeId);
            throw new ResourceNotFoundException(VehicleTypeConstants.MESSAGE_ERR_VEHICLE_TYPE_NOT_FOUND);
        } else {
            vehiclePart.setVehicleType(vehicleType);
        }

        VehiclePartCategoryEntity vehiclePartCategory = vehiclePartCategoryRepository.findByVehiclePartCategoryIdAndIsDeletedFalse(creationVehiclePartRequest.getVehiclePartCategoryId());
        if(vehiclePartCategory == null) {
            UUID categoryId = creationVehiclePartRequest.getVehiclePartCategoryId();
            log.warn(VehiclePartCategoryConstants.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND + categoryId);
            throw new ResourceNotFoundException(VehiclePartCategoryConstants.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        } else {
            vehiclePart.setVehiclePartCategories(vehiclePartCategory);
        }

        String search = UtilFunction.concatenateSearchField(creationVehiclePartRequest.getVehiclePartName(),
                vehicleType.getVehicleTypeName(),
                vehiclePartCategory.getPartCategoryName()
        );
        vehiclePart.setSearch(search);

        log.info(VehiclePartConstants.LOG_INFO_CREATING_VEHICLE_PART + creationVehiclePartRequest.getVehiclePartName());
        vehiclePartRepository.save(vehiclePart);
        return true;
    }

    @Override
    @Transactional

    public boolean updateVehiclePart(UUID id, UpdationVehiclePartRequest updationVehiclePartRequest) {
        checkDependOnAppointmentByVehiclePartId(id);

        VehiclePartEntity vehiclePart= vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(id);
        if(vehiclePart == null) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        if(Objects.equals(vehiclePart.getVehiclePartName(), updationVehiclePartRequest.getVehiclePartName())){
            vehiclePart.setVehiclePartName(updationVehiclePartRequest.getVehiclePartName());
        } else {
            checkDuplicatedPartName(updationVehiclePartRequest.getVehiclePartName());
            vehiclePart.setVehiclePartName(updationVehiclePartRequest.getVehiclePartName());
        }

        VehiclePartCategoryEntity vehiclePartCategory = vehiclePartCategoryRepository.findByVehiclePartCategoryIdAndIsDeletedFalse(updationVehiclePartRequest.getVehiclePartCategoryId());
        if(vehiclePartCategory == null) {
            UUID categoryId = updationVehiclePartRequest.getVehiclePartCategoryId();
            log.warn(VehiclePartCategoryConstants.LOG_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND + categoryId);
            throw new ResourceNotFoundException(VehiclePartCategoryConstants.MESSAGE_ERR_VEHICLE_PART_CATEGORY_NOT_FOUND);
        } else {
            vehiclePart.setVehiclePartCategories(vehiclePartCategory);
        }

        //Cập nhật ngày fill số lượng của phụ tùng
        if(vehiclePart.getCurrentQuantity() < updationVehiclePartRequest.getCurrentQuantity()) {
            vehiclePart.setLastRestockDate(LocalDateTime.now());
        }

        VehicleTypeEntity vehicleTypeEntity = vehiclePart.getVehicleType();
        String search = UtilFunction.concatenateSearchField(updationVehiclePartRequest.getVehiclePartName(),
                vehicleTypeEntity.getVehicleTypeName(),
                vehiclePartCategory.getPartCategoryName()
        );
        vehiclePart.setSearch(search);

        log.info(VehiclePartConstants.LOG_INFO_UPDATING_VEHICLE_PART + updationVehiclePartRequest.getVehiclePartName());
        vehiclePartMapper.toUpdate(vehiclePart, updationVehiclePartRequest);
        vehiclePartRepository.save(vehiclePart);
        return true;
    }

    @Override
    public boolean deleteVehiclePart(UUID id) {
        VehiclePartEntity vehiclePartEntity = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(id);
        if(vehiclePartEntity == null) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + id);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        // Kiểm tra phụ thuộc trong appointment
        checkDependOnAppointmentByVehiclePartId(id);

        vehiclePartEntity.setIsDeleted(true);

        log.info(VehiclePartConstants.LOG_INFO_DELETING_VEHICLE_PART + id);
        vehiclePartRepository.save(vehiclePartEntity);
        return true;
    }

    @Override
    public boolean restoreVehiclePart(UUID uuid) {
        VehiclePartEntity vehiclePartEntity = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedTrue(uuid);
        if(vehiclePartEntity == null) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + uuid);
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        vehiclePartEntity.setIsDeleted(false);

        log.info(VehiclePartConstants.LOG_INFO_RESTORING_VEHICLE_PART + uuid);
        vehiclePartRepository.save(vehiclePartEntity);
        return true;
    }

    @Override
    @Transactional
    public void subtractQuantity(UUID vehiclePartId, Integer quantityUsed){
        if(quantityUsed <= 0) {
            log.warn(VehiclePartConstants.LOG_ERR_NEGATIVE_QUANTITY + quantityUsed);
            throw new EntityValidationException(VehiclePartConstants.MESSAGE_ERR_NEGATIVE_QUANTITY);
        }

        VehiclePartEntity vehiclePart = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(vehiclePartId);
        if(vehiclePart == null) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + vehiclePartId);
            throw  new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        if (vehiclePart.getCurrentQuantity() < quantityUsed) {
            log.warn(VehiclePartConstants.LOG_ERR_INSUFFICIENT_VEHICLE_PART_STOCK + quantityUsed);
            throw new EntityValidationException(VehiclePartConstants.MESSAGE_ERR_INSUFFICIENT_VEHICLE_PART_STOCK);
        }

        // Trừ số lượng
        log.info(VehiclePartConstants.LOG_INFO_SUBTRACTING_QUANTITY, quantityUsed, vehiclePartId);
        vehiclePart.setCurrentQuantity(vehiclePart.getCurrentQuantity() - quantityUsed);
        vehiclePartRepository.save(vehiclePart);

        log.info(VehiclePartConstants.LOG_SUCCESS_SUBTRACTING_QUANTITY, quantityUsed, vehiclePart.getCurrentQuantity());
    }

    @Override
    @Transactional
    public void restoreQuantity(UUID vehiclePartId, Integer quantityToRestore) {
        if(quantityToRestore <= 0) {
            log.warn(VehiclePartConstants.LOG_ERR_NEGATIVE_QUANTITY + quantityToRestore);
            throw new EntityValidationException(VehiclePartConstants.MESSAGE_ERR_NEGATIVE_QUANTITY);
        }

        VehiclePartEntity vehiclePart = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(vehiclePartId);
        if(vehiclePart == null) {
            log.warn(VehiclePartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + vehiclePartId);
            throw  new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        // Hoàn lại số lượng
        log.info(VehiclePartConstants.LOG_INFO_RESTORING_QUANTITY, quantityToRestore, vehiclePartId);
        vehiclePart.setCurrentQuantity(vehiclePart.getCurrentQuantity() + quantityToRestore);
        vehiclePartRepository.save(vehiclePart);

        log.info(VehiclePartConstants.LOG_SUCCESS_RESTORING_QUANTITY, quantityToRestore, vehiclePart.getCurrentQuantity());
    }

    private void checkDuplicatedPartName(String name){
        if(vehiclePartRepository.existsByVehiclePartNameAndIsDeletedFalse(name)) {
            log.warn(VehiclePartConstants.LOG_ERR_DUPLICATED_VEHICLE_PART + name);
            throw new VehiclePartValidationException(VehiclePartConstants.MESSAGE_ERR_DUPLICATED_VEHICLE_PART);
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
