package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.WarrantyPackageConstants;
import com.fpt.evcare.dto.request.warranty_package.CreationWarrantyPackageRequest;
import com.fpt.evcare.dto.request.warranty_package.CreationWarrantyPackagePartRequest;
import com.fpt.evcare.dto.request.warranty_package.UpdationWarrantyPackageRequest;
import com.fpt.evcare.dto.request.warranty_package.UpdationWarrantyPackagePartRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.VehiclePartResponse;
import com.fpt.evcare.dto.response.WarrantyPackagePartResponse;
import com.fpt.evcare.dto.response.WarrantyPackageResponse;
import com.fpt.evcare.entity.VehicleEntity;
import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.entity.WarrantyPackageEntity;
import com.fpt.evcare.entity.WarrantyPackagePartEntity;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.VehicleMapper;
import com.fpt.evcare.mapper.VehiclePartMapper;
import com.fpt.evcare.mapper.WarrantyPackageMapper;
import com.fpt.evcare.mapper.WarrantyPackagePartMapper;
import com.fpt.evcare.repository.VehiclePartRepository;
import com.fpt.evcare.repository.VehicleRepository;
import com.fpt.evcare.repository.WarrantyPackagePartRepository;
import com.fpt.evcare.repository.WarrantyPackageRepository;
import com.fpt.evcare.service.WarrantyPackageService;
import com.fpt.evcare.utils.UtilFunction;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WarrantyPackageServiceImpl implements WarrantyPackageService {

    WarrantyPackageRepository warrantyPackageRepository;
    WarrantyPackagePartRepository warrantyPackagePartRepository;
    VehicleRepository vehicleRepository;
    VehiclePartRepository vehiclePartRepository;
    WarrantyPackageMapper warrantyPackageMapper;
    WarrantyPackagePartMapper warrantyPackagePartMapper;
    VehicleMapper vehicleMapper;
    VehiclePartMapper vehiclePartMapper;

    @Override
    public WarrantyPackageResponse getWarrantyPackageById(UUID id) {
        try {
            WarrantyPackageEntity entity = warrantyPackageRepository.findByWarrantyPackageIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> {
                        log.warn(WarrantyPackageConstants.LOG_ERR_WARRANTY_PACKAGE_NOT_FOUND, id);
                        return new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_NOT_FOUND);
                    });

            WarrantyPackageResponse response = warrantyPackageMapper.toResponse(entity);
            
            // Map warranty package parts if needed
            try {
                if (entity.getWarrantyPackageParts() != null && !entity.getWarrantyPackageParts().isEmpty()) {
                    List<WarrantyPackagePartResponse> partResponses = entity.getWarrantyPackageParts().stream()
                            .filter(part -> part != null && Boolean.FALSE.equals(part.getIsDeleted()))
                            .map(part -> {
                                try {
                                    return mapWarrantyPackagePartToResponse(part);
                                } catch (Exception e) {
                                    log.debug("Error mapping warranty package part: {}", e.getMessage());
                                    return null;
                                }
                            })
                            .filter(part -> part != null)
                            .collect(Collectors.toList());
                    response.setWarrantyPackageParts(partResponses);
                }
            } catch (Exception e) {
                log.debug("Error mapping warranty package parts: {}", e.getMessage());
                // Continue without parts if mapping fails
            }

            log.info(WarrantyPackageConstants.LOG_SUCCESS_SHOWING_WARRANTY_PACKAGE, id);
            return response;
        } catch (ResourceNotFoundException e) {
            // Re-throw ResourceNotFoundException để controller có thể xử lý
            throw e;
        } catch (Throwable t) {
            log.debug("Error getting warranty package {}: {}", id, t.getMessage());
            throw new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_NOT_FOUND);
        }
    }

    @Override
    public PageResponse<WarrantyPackageResponse> searchWarrantyPackages(String keyword, Boolean isValid, Pageable pageable) {
        // Đảm bảo không bao giờ throw exception - luôn trả về danh sách rỗng nếu có lỗi
        int pageNum = 0;
        int pageSize = 10;
        
        try {
            if (pageable != null) {
                pageNum = pageable.getPageNumber();
                pageSize = pageable.getPageSize();
            }
        } catch (Exception e) {
            log.warn("Error getting pageable info: {}", e.getMessage());
        }
        
        PageResponse<WarrantyPackageResponse> emptyResponse = PageResponse.<WarrantyPackageResponse>builder()
                .data(List.of())
                .page(pageNum)
                .size(pageSize)
                .totalElements(0)
                .totalPages(0)
                .last(true)
                .build();
        
        try {
            // Đơn giản hóa: dùng findAll() của JpaRepository (method có sẵn, không cần derived query)
            java.util.List<WarrantyPackageEntity> allEntities = null;
            
            try {
                allEntities = warrantyPackageRepository.findAll();
            } catch (Throwable t) { // Catch cả Error, không chỉ Exception
                // Log chi tiết để debug
                log.error("ERROR calling findAll on WarrantyPackageRepository: {}", t.getClass().getName());
                log.error("ERROR message: {}", t.getMessage());
                if (t.getCause() != null) {
                    log.error("ERROR cause: {}", t.getCause().getMessage());
                    log.error("ERROR cause class: {}", t.getCause().getClass().getName());
                }
                log.error("ERROR stack trace: ", t);
                return emptyResponse;
            }
            
            // Safety check
            if (allEntities == null || allEntities.isEmpty()) {
                log.debug("No warranty packages in database, returning empty list");
                return emptyResponse;
            }
            
            // Filter: isDeleted = false và isActive = true
            List<WarrantyPackageEntity> filtered;
            try {
                filtered = allEntities.stream()
                        .filter(entity -> {
                            try {
                                if (entity == null) return false;
                                
                                // Luôn filter isDeleted = false
                                if (entity.getIsDeleted() == null || Boolean.TRUE.equals(entity.getIsDeleted())) {
                                    return false;
                                }
                                // Luôn filter isActive = true
                                if (entity.getIsActive() == null || Boolean.FALSE.equals(entity.getIsActive())) {
                                    return false;
                                }
                                
                                // Filter by keyword
                                if (keyword != null && !keyword.trim().isEmpty()) {
                                    String searchLower = keyword.trim().toLowerCase();
                                    String searchField = (entity.getSearch() != null) ? entity.getSearch().toLowerCase() : "";
                                    String packageName = (entity.getWarrantyPackageName() != null) ? entity.getWarrantyPackageName().toLowerCase() : "";
                                    if (!searchField.contains(searchLower) && !packageName.contains(searchLower)) {
                                        return false;
                                    }
                                }
                                
                                // Filter by isValid
                                if (isValid != null && isValid) {
                                    if (entity.getStartDate() == null || entity.getEndDate() == null) {
                                        return false;
                                    }
                                    try {
                                        java.time.LocalDateTime now = java.time.LocalDateTime.now();
                                        if (entity.getStartDate().isAfter(now) || entity.getEndDate().isBefore(now)) {
                                            return false;
                                        }
                                    } catch (Exception e) {
                                        log.warn("Error checking date range: {}", e.getMessage());
                                        return false;
                                    }
                                }
                                
                                return true;
                            } catch (Exception e) {
                                log.warn("Error filtering entity: {}", e.getMessage());
                                return false;
                            }
                        })
                        .sorted((a, b) -> {
                            try {
                                String nameA = (a != null && a.getWarrantyPackageName() != null) ? a.getWarrantyPackageName() : "";
                                String nameB = (b != null && b.getWarrantyPackageName() != null) ? b.getWarrantyPackageName() : "";
                                return nameA.compareToIgnoreCase(nameB);
                            } catch (Exception e) {
                                return 0;
                            }
                        })
                        .collect(Collectors.toList());
            } catch (Throwable t) {
                log.debug("Error filtering entities: {}", t.getMessage());
                return emptyResponse;
            }
            
            // Safety check
            if (filtered == null) {
                filtered = List.of();
            }
            
            // Pagination
            int totalElements = filtered.size();
            int start = 0;
            int end = totalElements;
            
            try {
                if (pageable != null) {
                    start = (int) pageable.getOffset();
                }
                end = Math.min((start + pageSize), totalElements);
            } catch (Exception e) {
                log.warn("Error calculating pagination: {}", e.getMessage());
            }
            
            List<WarrantyPackageEntity> pagedContent;
            try {
                pagedContent = start < totalElements ? filtered.subList(start, end) : List.of();
            } catch (Exception e) {
                log.warn("Error creating sublist: {}", e.getMessage());
                pagedContent = List.of();
            }
            
            int totalPages = 0;
            boolean isLast = true;
            try {
                totalPages = totalElements > 0 ? (int) Math.ceil((double) totalElements / pageSize) : 0;
                isLast = (pageNum + 1) >= totalPages || totalPages == 0;
            } catch (Exception e) {
                log.warn("Error calculating pagination info: {}", e.getMessage());
            }
            
            // Map entities to responses với try-catch riêng
            List<WarrantyPackageResponse> responses;
            try {
                responses = pagedContent.stream()
                        .map(entity -> {
                            try {
                                if (entity == null) return null;
                                return warrantyPackageMapper.toResponse(entity);
                            } catch (Throwable t) {
                                log.warn("Error mapping warranty package entity to response: {}", t.getMessage());
                                return null;
                            }
                        })
                        .filter(response -> response != null)
                        .collect(Collectors.toList());
            } catch (Throwable t) {
                log.debug("Error mapping warranty packages: {}", t.getMessage());
                return emptyResponse;
            }

            // Safety check
            if (responses == null) {
                responses = List.of();
            }

            try {
                return PageResponse.<WarrantyPackageResponse>builder()
                        .data(responses)
                        .page(pageNum)
                        .size(pageSize)
                        .totalElements(totalElements)
                        .totalPages(totalPages)
                        .last(isLast)
                        .build();
            } catch (Throwable t) {
                log.error("Error building response: {}", t.getMessage());
                return emptyResponse;
            }
        } catch (Throwable t) { // Catch cả Error, không chỉ Exception
            // Log chi tiết để debug lỗi 500
            log.error("ERROR in searchWarrantyPackages (unexpected): {}", t.getClass().getName());
            log.error("ERROR message: {}", t.getMessage());
            if (t.getCause() != null) {
                log.error("ERROR cause: {}", t.getCause().getMessage());
                log.error("ERROR cause class: {}", t.getCause().getClass().getName());
            }
            log.error("ERROR stack trace: ", t);
            // Luôn trả về danh sách rỗng, KHÔNG BAO GIỜ throw
            return emptyResponse;
        }
    }

    @Override
    @Transactional
    public boolean createWarrantyPackage(CreationWarrantyPackageRequest request) {
        try {
            // Validate date range
            if (request.getStartDate() != null && request.getEndDate() != null) {
                if (request.getEndDate().isBefore(request.getStartDate())) {
                    log.warn(WarrantyPackageConstants.LOG_ERR_INVALID_WARRANTY_DATE_RANGE, 
                            request.getStartDate() + " - " + request.getEndDate());
                    throw new EntityValidationException(WarrantyPackageConstants.MESSAGE_ERR_INVALID_WARRANTY_DATE_RANGE);
                }
            }

            WarrantyPackageEntity entity;
            try {
                entity = warrantyPackageMapper.toEntity(request);
            } catch (Exception e) {
                log.debug("Error mapping warranty package entity: {}", e.getMessage());
                throw new EntityValidationException("Không thể tạo gói bảo hành từ dữ liệu đã cung cấp");
            }
            
            String search = UtilFunction.concatenateSearchField(
                    request.getWarrantyPackageName(),
                    request.getDescription()
            );
            entity.setSearch(search);

            log.info(WarrantyPackageConstants.LOG_INFO_CREATING_WARRANTY_PACKAGE, request.getWarrantyPackageName());
            warrantyPackageRepository.save(entity);
            log.info(WarrantyPackageConstants.LOG_SUCCESS_CREATING_WARRANTY_PACKAGE, entity.getWarrantyPackageId());
            return true;
        } catch (EntityValidationException | ResourceNotFoundException e) {
            // Re-throw validation exceptions để controller có thể xử lý
            throw e;
        } catch (Throwable t) {
            log.error("ERROR creating warranty package: {}", t.getClass().getName());
            log.error("ERROR message: {}", t.getMessage());
            if (t.getCause() != null) {
                log.error("ERROR cause: {}", t.getCause().getMessage());
            }
            log.error("ERROR stack trace: ", t);
            throw new EntityValidationException("Không thể tạo gói bảo hành: " + (t.getMessage() != null ? t.getMessage() : "Lỗi không xác định"));
        }
    }

    @Override
    @Transactional
    public boolean updateWarrantyPackage(UUID id, UpdationWarrantyPackageRequest request) {
        try {
            WarrantyPackageEntity entity = warrantyPackageRepository.findByWarrantyPackageIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> {
                        log.warn(WarrantyPackageConstants.LOG_ERR_WARRANTY_PACKAGE_NOT_FOUND, id);
                        return new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_NOT_FOUND);
                    });

            // Validate date range
            if (request.getStartDate() != null && request.getEndDate() != null) {
                if (request.getEndDate().isBefore(request.getStartDate())) {
                    log.warn(WarrantyPackageConstants.LOG_ERR_INVALID_WARRANTY_DATE_RANGE, 
                            request.getStartDate() + " - " + request.getEndDate());
                    throw new EntityValidationException(WarrantyPackageConstants.MESSAGE_ERR_INVALID_WARRANTY_DATE_RANGE);
                }
            }

            try {
                warrantyPackageMapper.toUpdate(entity, request);
            } catch (Exception e) {
                log.debug("Error mapping update request: {}", e.getMessage());
                throw new EntityValidationException("Không thể cập nhật gói bảo hành từ dữ liệu đã cung cấp");
            }
            
            String search = UtilFunction.concatenateSearchField(
                    request.getWarrantyPackageName(),
                    request.getDescription()
            );
            entity.setSearch(search);

            log.info(WarrantyPackageConstants.LOG_INFO_UPDATING_WARRANTY_PACKAGE, id);
            warrantyPackageRepository.save(entity);
            log.info(WarrantyPackageConstants.LOG_SUCCESS_UPDATING_WARRANTY_PACKAGE, id);
            return true;
        } catch (EntityValidationException | ResourceNotFoundException e) {
            // Re-throw validation exceptions để controller có thể xử lý
            throw e;
        } catch (Throwable t) {
            log.error("ERROR updating warranty package {}: {}", id, t.getClass().getName());
            log.error("ERROR message: {}", t.getMessage());
            if (t.getCause() != null) {
                log.error("ERROR cause: {}", t.getCause().getMessage());
            }
            log.error("ERROR stack trace: ", t);
            throw new EntityValidationException("Không thể cập nhật gói bảo hành: " + (t.getMessage() != null ? t.getMessage() : "Lỗi không xác định"));
        }
    }

    @Override
    @Transactional
    public boolean deleteWarrantyPackage(UUID id) {
        try {
            WarrantyPackageEntity entity = warrantyPackageRepository.findByWarrantyPackageIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> {
                        log.warn(WarrantyPackageConstants.LOG_ERR_WARRANTY_PACKAGE_NOT_FOUND, id);
                        return new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_NOT_FOUND);
                    });

            entity.setIsDeleted(true);
            log.info(WarrantyPackageConstants.LOG_INFO_DELETING_WARRANTY_PACKAGE, id);
            warrantyPackageRepository.save(entity);
            log.info(WarrantyPackageConstants.LOG_SUCCESS_DELETING_WARRANTY_PACKAGE, id);
            return true;
        } catch (ResourceNotFoundException e) {
            // Re-throw ResourceNotFoundException để controller có thể xử lý
            throw e;
        } catch (Throwable t) {
            log.debug("Error deleting warranty package {}: {}", id, t.getMessage());
            throw new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_NOT_FOUND);
        }
    }

    @Override
    public WarrantyPackagePartResponse getWarrantyPackagePartById(UUID id) {
        try {
            WarrantyPackagePartEntity entity = warrantyPackagePartRepository.findByWarrantyPackagePartIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> {
                        log.warn(WarrantyPackageConstants.LOG_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND, id);
                        return new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND);
                    });

            try {
                return mapWarrantyPackagePartToResponse(entity);
            } catch (Exception e) {
                log.debug("Error mapping warranty package part: {}", e.getMessage());
                throw new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND);
            }
        } catch (ResourceNotFoundException e) {
            // Re-throw ResourceNotFoundException để controller có thể xử lý
            throw e;
        } catch (Throwable t) {
            log.debug("Error getting warranty package part {}: {}", id, t.getMessage());
            throw new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND);
        }
    }

    @Override
    public PageResponse<WarrantyPackagePartResponse> getWarrantyPackagePartsByPackageId(UUID warrantyPackageId, Pageable pageable) {
        int pageNum = 0;
        int pageSize = 10;
        
        try {
            if (pageable != null) {
                pageNum = pageable.getPageNumber();
                pageSize = pageable.getPageSize();
            }
        } catch (Exception e) {
            log.debug("Error getting pageable info: {}", e.getMessage());
        }
        
        PageResponse<WarrantyPackagePartResponse> emptyResponse = PageResponse.<WarrantyPackagePartResponse>builder()
                .data(List.of())
                .page(pageNum)
                .size(pageSize)
                .totalElements(0)
                .totalPages(0)
                .last(true)
                .build();
        
        try {
            Page<WarrantyPackagePartEntity> entityPage = null;
            
            try {
                entityPage = warrantyPackagePartRepository.findByWarrantyPackage_WarrantyPackageIdAndIsDeletedFalse(warrantyPackageId, pageable);
            } catch (Throwable t) {
                log.debug("Error calling repository method: {}", t.getMessage());
                return emptyResponse;
            }

            // Nếu null hoặc rỗng, trả về danh sách rỗng
            if (entityPage == null || entityPage.getTotalElements() == 0) {
                return emptyResponse;
            }

            List<WarrantyPackagePartResponse> responses;
            try {
                responses = entityPage.getContent().stream()
                        .map(part -> {
                            try {
                                if (part == null) return null;
                                return mapWarrantyPackagePartToResponse(part);
                            } catch (Exception e) {
                                log.debug("Error mapping warranty package part: {}", e.getMessage());
                                return null;
                            }
                        })
                        .filter(response -> response != null)
                        .collect(Collectors.toList());
            } catch (Throwable t) {
                log.debug("Error mapping warranty package parts: {}", t.getMessage());
                return emptyResponse;
            }

            // Safety check
            if (responses == null) {
                responses = List.of();
            }

            try {
                return PageResponse.<WarrantyPackagePartResponse>builder()
                        .data(responses)
                        .page(entityPage.getNumber())
                        .size(entityPage.getSize())
                        .totalElements(entityPage.getTotalElements())
                        .totalPages(entityPage.getTotalPages())
                        .last(entityPage.isLast())
                        .build();
            } catch (Throwable t) {
                log.debug("Error building response: {}", t.getMessage());
                return emptyResponse;
            }
        } catch (Throwable t) {
            log.debug("Error getting warranty package parts for package {}: {}", warrantyPackageId, t.getMessage());
            // Trả về danh sách rỗng thay vì throw exception
            return emptyResponse;
        }
    }

    @Override
    @Transactional
    public boolean createWarrantyPackagePart(UUID warrantyPackageId, CreationWarrantyPackagePartRequest request) {
        try {
            WarrantyPackageEntity warrantyPackage = warrantyPackageRepository.findByWarrantyPackageIdAndIsDeletedFalse(warrantyPackageId)
                    .orElseThrow(() -> {
                        log.warn(WarrantyPackageConstants.LOG_ERR_WARRANTY_PACKAGE_NOT_FOUND, warrantyPackageId);
                        return new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_NOT_FOUND);
                    });

            VehiclePartEntity vehiclePart = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(request.getVehiclePartId());
            if (vehiclePart == null) {
                throw new ResourceNotFoundException("Không tìm thấy phụ tùng");
            }

            WarrantyPackagePartEntity entity;
            try {
                entity = warrantyPackagePartMapper.toEntity(request);
            } catch (Exception e) {
                log.debug("Error mapping warranty package part entity: {}", e.getMessage());
                throw new EntityValidationException("Không thể tạo phụ tùng bảo hành từ dữ liệu đã cung cấp");
            }
            
            entity.setWarrantyPackage(warrantyPackage);
            entity.setVehiclePart(vehiclePart);

            if (request.getVehicleId() != null) {
                try {
                    VehicleEntity vehicle = vehicleRepository.findByVehicleIdAndIsDeletedFalse(request.getVehicleId());
                    if (vehicle == null) {
                        throw new ResourceNotFoundException("Không tìm thấy xe");
                    }
                    entity.setVehicle(vehicle);
                } catch (Exception e) {
                    log.debug("Error finding vehicle: {}", e.getMessage());
                    throw new ResourceNotFoundException("Không tìm thấy xe");
                }
            }

            // Calculate warranty expiry date if not provided
            try {
                if (request.getWarrantyExpiryDate() == null && request.getInstalledDate() != null && warrantyPackage.getWarrantyPeriodMonths() != null) {
                    LocalDateTime expiryDate = request.getInstalledDate().plusMonths(warrantyPackage.getWarrantyPeriodMonths());
                    entity.setWarrantyExpiryDate(expiryDate);
                } else if (request.getWarrantyExpiryDate() != null) {
                    entity.setWarrantyExpiryDate(request.getWarrantyExpiryDate());
                }
            } catch (Exception e) {
                log.debug("Error calculating warranty expiry date: {}", e.getMessage());
                // Continue without expiry date if calculation fails
            }

            String search;
            try {
                search = UtilFunction.concatenateSearchField(
                        warrantyPackage.getWarrantyPackageName(),
                        vehiclePart.getVehiclePartName()
                );
                entity.setSearch(search);
            } catch (Exception e) {
                log.debug("Error creating search field: {}", e.getMessage());
                // Continue without search field
            }

            log.info("Creating warranty package part for package: {} and part: {}", warrantyPackageId, request.getVehiclePartId());
            warrantyPackagePartRepository.save(entity);
            return true;
        } catch (EntityValidationException | ResourceNotFoundException e) {
            // Re-throw validation exceptions để controller có thể xử lý
            throw e;
        } catch (Throwable t) {
            log.debug("Error creating warranty package part: {}", t.getMessage());
            throw new EntityValidationException("Không thể tạo phụ tùng bảo hành: " + (t.getMessage() != null ? t.getMessage() : "Lỗi không xác định"));
        }
    }

    @Override
    @Transactional
    public boolean updateWarrantyPackagePart(UUID id, UpdationWarrantyPackagePartRequest request) {
        try {
            WarrantyPackagePartEntity entity = warrantyPackagePartRepository.findByWarrantyPackagePartIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> {
                        log.warn(WarrantyPackageConstants.LOG_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND, id);
                        return new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND);
                    });

            if (request.getVehicleId() != null) {
                try {
                    VehicleEntity vehicle = vehicleRepository.findByVehicleIdAndIsDeletedFalse(request.getVehicleId());
                    if (vehicle == null) {
                        throw new ResourceNotFoundException("Không tìm thấy xe");
                    }
                    entity.setVehicle(vehicle);
                } catch (Exception e) {
                    log.debug("Error finding vehicle: {}", e.getMessage());
                    throw new ResourceNotFoundException("Không tìm thấy xe");
                }
            } else {
                entity.setVehicle(null);
            }

            try {
                warrantyPackagePartMapper.toUpdate(entity, request);
            } catch (Exception e) {
                log.debug("Error mapping update request: {}", e.getMessage());
                throw new EntityValidationException("Không thể cập nhật phụ tùng bảo hành từ dữ liệu đã cung cấp");
            }

            log.info("Updating warranty package part: {}", id);
            warrantyPackagePartRepository.save(entity);
            return true;
        } catch (EntityValidationException | ResourceNotFoundException e) {
            // Re-throw validation exceptions để controller có thể xử lý
            throw e;
        } catch (Throwable t) {
            log.debug("Error updating warranty package part {}: {}", id, t.getMessage());
            throw new EntityValidationException("Không thể cập nhật phụ tùng bảo hành: " + (t.getMessage() != null ? t.getMessage() : "Lỗi không xác định"));
        }
    }

    @Override
    @Transactional
    public boolean deleteWarrantyPackagePart(UUID id) {
        try {
            WarrantyPackagePartEntity entity = warrantyPackagePartRepository.findByWarrantyPackagePartIdAndIsDeletedFalse(id)
                    .orElseThrow(() -> {
                        log.warn(WarrantyPackageConstants.LOG_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND, id);
                        return new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND);
                    });

            entity.setIsDeleted(true);
            log.info("Deleting warranty package part: {}", id);
            warrantyPackagePartRepository.save(entity);
            return true;
        } catch (ResourceNotFoundException e) {
            // Re-throw ResourceNotFoundException để controller có thể xử lý
            throw e;
        } catch (Throwable t) {
            log.debug("Error deleting warranty package part {}: {}", id, t.getMessage());
            throw new ResourceNotFoundException(WarrantyPackageConstants.MESSAGE_ERR_WARRANTY_PACKAGE_PART_NOT_FOUND);
        }
    }

    @Override
    public boolean isVehiclePartUnderWarranty(UUID vehicleId, UUID vehiclePartId) {
        try {
            LocalDateTime checkDate = LocalDateTime.now();
            
            if (vehicleId != null) {
                try {
                    return warrantyPackagePartRepository.existsValidWarrantyForVehiclePart(vehicleId, vehiclePartId, checkDate);
                } catch (Exception e) {
                    log.debug("Error checking warranty for vehicle part {} for vehicle {}: {}", vehiclePartId, vehicleId, e.getMessage());
                    return false;
                }
            } else {
                try {
                    return warrantyPackagePartRepository.existsValidWarrantyForVehiclePartGeneral(vehiclePartId, checkDate);
                } catch (Exception e) {
                    log.debug("Error checking warranty for vehicle part {} (general): {}", vehiclePartId, e.getMessage());
                    return false;
                }
            }
        } catch (Throwable t) {
            log.debug("Error checking warranty for vehicle part {}: {}", vehiclePartId, t.getMessage());
            // Trả về false nếu có lỗi thay vì throw exception
            return false;
        }
    }

    private WarrantyPackagePartResponse mapWarrantyPackagePartToResponse(WarrantyPackagePartEntity entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
        
        WarrantyPackagePartResponse response;
        try {
            response = warrantyPackagePartMapper.toResponse(entity);
        } catch (Exception e) {
            log.debug("Error mapping warranty package part entity to response: {}", e.getMessage());
            throw new RuntimeException("Error mapping warranty package part", e);
        }

        try {
            if (entity.getWarrantyPackage() != null) {
                response.setWarrantyPackage(warrantyPackageMapper.toResponse(entity.getWarrantyPackage()));
            }
        } catch (Exception e) {
            log.debug("Error mapping warranty package: {}", e.getMessage());
            // Continue without warranty package info
        }

        try {
            if (entity.getVehicle() != null) {
                response.setVehicle(vehicleMapper.toVehicleResponse(entity.getVehicle()));
            }
        } catch (Exception e) {
            log.debug("Error mapping vehicle: {}", e.getMessage());
            // Continue without vehicle info
        }

        try {
            if (entity.getVehiclePart() != null) {
                VehiclePartResponse vehiclePartResponse = vehiclePartMapper.toResponse(entity.getVehiclePart());
                response.setVehiclePart(vehiclePartResponse);
            }
        } catch (Exception e) {
            log.debug("Error mapping vehicle part: {}", e.getMessage());
            // Continue without vehicle part info
        }

        return response;
    }
}

