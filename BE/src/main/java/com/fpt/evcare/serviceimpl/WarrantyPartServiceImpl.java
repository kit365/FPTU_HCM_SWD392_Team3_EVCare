package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.WarrantyPartConstants;
import com.fpt.evcare.dto.request.warranty_part.CreationWarrantyPartRequest;
import com.fpt.evcare.dto.request.warranty_part.UpdationWarrantyPartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehiclePartResponse;
import com.fpt.evcare.dto.response.WarrantyPartResponse;
import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.entity.WarrantyPartEntity;
import com.fpt.evcare.enums.WarrantyDiscountTypeEnum;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.VehiclePartMapper;
import com.fpt.evcare.mapper.WarrantyPartMapper;
import com.fpt.evcare.repository.VehiclePartRepository;
import com.fpt.evcare.repository.WarrantyPartRepository;
import com.fpt.evcare.service.WarrantyPartService;
import com.fpt.evcare.utils.UtilFunction;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WarrantyPartServiceImpl implements WarrantyPartService {

    WarrantyPartRepository warrantyPartRepository;
    WarrantyPartMapper warrantyPartMapper;
    VehiclePartRepository vehiclePartRepository;
    VehiclePartMapper vehiclePartMapper;

    @Override
    @Transactional(readOnly = true)
    public WarrantyPartResponse getWarrantyPart(UUID warrantyPartId) {
        log.info(WarrantyPartConstants.LOG_INFO_SHOWING_WARRANTY_PART, warrantyPartId);
        
        WarrantyPartEntity entity = warrantyPartRepository.findByWarrantyPartIdAndIsDeletedFalse(warrantyPartId)
                .orElseThrow(() -> {
                    log.warn(WarrantyPartConstants.LOG_ERR_WARRANTY_PART_NOT_FOUND, warrantyPartId);
                    return new ResourceNotFoundException(WarrantyPartConstants.MESSAGE_ERR_WARRANTY_PART_NOT_FOUND);
                });

        // Force initialization of lazy-loaded relationships within transaction
        initializeWarrantyPartRelations(entity);

        WarrantyPartResponse response = warrantyPartMapper.toResponse(entity);
        
        // Map vehiclePart manually
        if (entity.getVehiclePart() != null) {
            VehiclePartResponse vehiclePartResponse = vehiclePartMapper.toResponse(entity.getVehiclePart());
            response.setVehiclePart(vehiclePartResponse);
        }

        log.info(WarrantyPartConstants.LOG_SUCCESS_SHOWING_WARRANTY_PART, warrantyPartId);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WarrantyPartResponse> searchWarrantyPart(String keyword, Pageable pageable) {
        log.info(WarrantyPartConstants.LOG_INFO_SHOWING_WARRANTY_PART_LIST);
        
        Page<WarrantyPartEntity> entityPage;
        
        if (keyword == null || keyword.isEmpty()) {
            entityPage = warrantyPartRepository.findAllByIsDeletedFalse(pageable);
        } else {
            entityPage = warrantyPartRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
        }

        if (entityPage == null || entityPage.getTotalElements() == 0) {
            log.info(WarrantyPartConstants.LOG_INFO_NO_WARRANTY_PARTS_FOUND);
            return PageResponse.<WarrantyPartResponse>builder()
                    .data(List.of())
                    .page(pageable.getPageNumber())
                    .size(pageable.getPageSize())
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        // Force initialization of lazy-loaded relationships within transaction
        entityPage.getContent().forEach(this::initializeWarrantyPartRelations);

        List<WarrantyPartResponse> responseList = entityPage.getContent().stream()
                .map(entity -> {
                    WarrantyPartResponse response = warrantyPartMapper.toResponse(entity);
                    if (entity.getVehiclePart() != null) {
                        VehiclePartResponse vehiclePartResponse = vehiclePartMapper.toResponse(entity.getVehiclePart());
                        response.setVehiclePart(vehiclePartResponse);
                    }
                    return response;
                })
                .toList();

        log.info(WarrantyPartConstants.LOG_SUCCESS_SHOWING_WARRANTY_PART_LIST);
        return PageResponse.<WarrantyPartResponse>builder()
                .data(responseList)
                .page(entityPage.getNumber())
                .size(entityPage.getSize())
                .totalElements(entityPage.getTotalElements())
                .totalPages(entityPage.getTotalPages())
                .last(entityPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WarrantyPartResponse> getWarrantyPartsByVehiclePartId(UUID vehiclePartId, Pageable pageable) {
        log.info("Đang lấy danh sách bảo hành phụ tùng theo vehiclePartId: {}", vehiclePartId);
        
        Page<WarrantyPartEntity> entityPage = warrantyPartRepository
                .findByVehiclePartVehiclePartIdAndIsDeletedFalse(vehiclePartId, pageable);

        if (entityPage == null || entityPage.getTotalElements() == 0) {
            log.info(WarrantyPartConstants.LOG_INFO_NO_WARRANTY_PARTS_FOUND);
            return PageResponse.<WarrantyPartResponse>builder()
                    .data(List.of())
                    .page(pageable.getPageNumber())
                    .size(pageable.getPageSize())
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        // Force initialization of lazy-loaded relationships within transaction
        entityPage.getContent().forEach(this::initializeWarrantyPartRelations);

        List<WarrantyPartResponse> responseList = entityPage.getContent().stream()
                .map(entity -> {
                    WarrantyPartResponse response = warrantyPartMapper.toResponse(entity);
                    if (entity.getVehiclePart() != null) {
                        VehiclePartResponse vehiclePartResponse = vehiclePartMapper.toResponse(entity.getVehiclePart());
                        response.setVehiclePart(vehiclePartResponse);
                    }
                    return response;
                })
                .toList();

        log.info("Lấy danh sách bảo hành phụ tùng theo vehiclePartId thành công: {}", vehiclePartId);
        return PageResponse.<WarrantyPartResponse>builder()
                .data(responseList)
                .page(entityPage.getNumber())
                .size(entityPage.getSize())
                .totalElements(entityPage.getTotalElements())
                .totalPages(entityPage.getTotalPages())
                .last(entityPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public boolean createWarrantyPart(CreationWarrantyPartRequest request) {
        log.info(WarrantyPartConstants.LOG_INFO_CREATING_WARRANTY_PART, request.getVehiclePartId());
        
        // Validate discountValue
        validateDiscountValue(request.getDiscountType(), request.getDiscountValue());
        
        // Check duplicate warranty part for the same vehiclePart
        if (warrantyPartRepository.existsByVehiclePartVehiclePartIdAndIsDeletedFalse(request.getVehiclePartId())) {
            log.warn(WarrantyPartConstants.LOG_ERR_DUPLICATED_WARRANTY_PART, request.getVehiclePartId());
            throw new EntityValidationException(WarrantyPartConstants.MESSAGE_ERR_DUPLICATED_WARRANTY_PART);
        }
        
        // Get vehiclePart
        VehiclePartEntity vehiclePart = vehiclePartRepository
                .findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(request.getVehiclePartId());
        if (vehiclePart == null) {
            log.warn(WarrantyPartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND, request.getVehiclePartId());
            throw new ResourceNotFoundException(WarrantyPartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }
        
        // Map to entity
        WarrantyPartEntity entity = warrantyPartMapper.toEntity(request);
        entity.setVehiclePart(vehiclePart);
        
        // If discountType is FREE, ensure discountValue is null
        if (request.getDiscountType() == WarrantyDiscountTypeEnum.FREE) {
            entity.setDiscountValue(null);
        }
        
        // Create search field
        String search = UtilFunction.concatenateSearchField(
                vehiclePart.getVehiclePartName(),
                request.getDiscountType().name(),
                request.getValidityPeriod().toString(),
                request.getValidityPeriodUnit().name()
        );
        entity.setSearch(search);
        
        warrantyPartRepository.save(entity);
        log.info(WarrantyPartConstants.LOG_SUCCESS_CREATING_WARRANTY_PART, entity.getWarrantyPartId());
        return true;
    }

    @Override
    @Transactional
    public boolean updateWarrantyPart(UUID id, UpdationWarrantyPartRequest request) {
        log.info(WarrantyPartConstants.LOG_INFO_UPDATING_WARRANTY_PART, id);
        
        WarrantyPartEntity entity = warrantyPartRepository.findByWarrantyPartIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn(WarrantyPartConstants.LOG_ERR_WARRANTY_PART_NOT_FOUND, id);
                    return new ResourceNotFoundException(WarrantyPartConstants.MESSAGE_ERR_WARRANTY_PART_NOT_FOUND);
                });
        
        // Validate discountValue
        validateDiscountValue(request.getDiscountType(), request.getDiscountValue());
        
        // Check if vehiclePart changed and if new vehiclePart exists
        if (!entity.getVehiclePart().getVehiclePartId().equals(request.getVehiclePartId())) {
            // Check duplicate for new vehiclePart
            if (warrantyPartRepository.existsByVehiclePartVehiclePartIdAndIsDeletedFalse(request.getVehiclePartId())) {
                log.warn(WarrantyPartConstants.LOG_ERR_DUPLICATED_WARRANTY_PART, request.getVehiclePartId());
                throw new EntityValidationException(WarrantyPartConstants.MESSAGE_ERR_DUPLICATED_WARRANTY_PART);
            }
            
            // Get new vehiclePart
            VehiclePartEntity vehiclePart = vehiclePartRepository
                    .findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(request.getVehiclePartId());
            if (vehiclePart == null) {
                log.warn(WarrantyPartConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND, request.getVehiclePartId());
                throw new ResourceNotFoundException(WarrantyPartConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
            }
            entity.setVehiclePart(vehiclePart);
        }
        
        // Update entity
        warrantyPartMapper.toUpdate(entity, request);
        
        // If discountType is FREE, ensure discountValue is null
        if (request.getDiscountType() == WarrantyDiscountTypeEnum.FREE) {
            entity.setDiscountValue(null);
        }
        
        // Update isActive if provided
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        
        // Update search field
        String search = UtilFunction.concatenateSearchField(
                entity.getVehiclePart().getVehiclePartName(),
                request.getDiscountType().name(),
                request.getValidityPeriod().toString(),
                request.getValidityPeriodUnit().name()
        );
        entity.setSearch(search);
        
        warrantyPartRepository.save(entity);
        log.info(WarrantyPartConstants.LOG_SUCCESS_UPDATING_WARRANTY_PART, id);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteWarrantyPart(UUID id) {
        log.info(WarrantyPartConstants.LOG_INFO_DELETING_WARRANTY_PART, id);
        
        WarrantyPartEntity entity = warrantyPartRepository.findByWarrantyPartIdAndIsDeletedFalse(id)
                .orElseThrow(() -> {
                    log.warn(WarrantyPartConstants.LOG_ERR_WARRANTY_PART_NOT_FOUND, id);
                    return new ResourceNotFoundException(WarrantyPartConstants.MESSAGE_ERR_WARRANTY_PART_NOT_FOUND);
                });
        
        entity.setIsDeleted(true);
        warrantyPartRepository.save(entity);
        
        log.info(WarrantyPartConstants.LOG_SUCCESS_DELETING_WARRANTY_PART, id);
        return true;
    }

    @Override
    @Transactional
    public boolean restoreWarrantyPart(UUID id) {
        log.info(WarrantyPartConstants.LOG_INFO_RESTORING_WARRANTY_PART, id);
        
        WarrantyPartEntity entity = warrantyPartRepository.findByWarrantyPartIdAndIsDeletedTrue(id)
                .orElseThrow(() -> {
                    log.warn(WarrantyPartConstants.LOG_ERR_WARRANTY_PART_NOT_FOUND, id);
                    return new ResourceNotFoundException(WarrantyPartConstants.MESSAGE_ERR_WARRANTY_PART_NOT_FOUND);
                });
        
        entity.setIsDeleted(false);
        warrantyPartRepository.save(entity);
        
        log.info(WarrantyPartConstants.LOG_SUCCESS_RESTORING_WARRANTY_PART, id);
        return true;
    }

    /**
     * Helper method to force initialization of lazy-loaded warranty part relationships
     * This must be called within an active transaction
     */
    private void initializeWarrantyPartRelations(WarrantyPartEntity warrantyPart) {
        if (warrantyPart == null) {
            return;
        }
        
        // Initialize vehiclePart relationship
        if (warrantyPart.getVehiclePart() != null) {
            warrantyPart.getVehiclePart().getVehiclePartId(); // Access to trigger loading
            // Also initialize vehiclePart's relationships if needed
            if (warrantyPart.getVehiclePart().getVehicleType() != null) {
                warrantyPart.getVehiclePart().getVehicleType().getVehicleTypeId(); // Load vehicle type
            }
            if (warrantyPart.getVehiclePart().getVehiclePartCategories() != null) {
                warrantyPart.getVehiclePart().getVehiclePartCategories().getVehiclePartCategoryId(); // Load category
            }
        }
    }

    private void validateDiscountValue(WarrantyDiscountTypeEnum discountType, BigDecimal discountValue) {
        if (discountType == WarrantyDiscountTypeEnum.PERCENTAGE) {
            if (discountValue == null) {
                log.warn(WarrantyPartConstants.LOG_ERR_INVALID_DISCOUNT_VALUE, "null");
                throw new EntityValidationException(WarrantyPartConstants.MESSAGE_ERR_DISCOUNT_VALUE_REQUIRED);
            }
            if (discountValue.compareTo(BigDecimal.ZERO) < 0 || discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
                log.warn(WarrantyPartConstants.LOG_ERR_INVALID_DISCOUNT_VALUE, discountValue);
                throw new EntityValidationException(WarrantyPartConstants.MESSAGE_ERR_INVALID_DISCOUNT_VALUE);
            }
        }
        // If FREE, discountValue can be null
    }
}
