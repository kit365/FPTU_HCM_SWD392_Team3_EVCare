package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.MaintenanceManagementConstants;
import com.fpt.evcare.constants.MaintenanceRecordConstants;
import com.fpt.evcare.constants.VehiclePartConstants;
import com.fpt.evcare.dto.request.maintain_record.CreationMaintenanceRecordRequest;
import com.fpt.evcare.dto.request.maintain_record.UpdationMaintenanceRecordRequest;
import com.fpt.evcare.dto.response.*;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.exception.EntityValidationException;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.*;
import com.fpt.evcare.repository.*;
import com.fpt.evcare.service.MaintenanceCostService;
import com.fpt.evcare.service.MaintenanceRecordService;
import com.fpt.evcare.service.VehiclePartService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MaintenanceRecordServiceImpl implements MaintenanceRecordService {

    MaintenanceManagementRepository maintenanceManagementRepository;
    MaintenanceRecordRepository maintenanceRecordRepository;
    MaintenanceRecordMapper maintenanceRecordMapper;
    VehiclePartRepository vehiclePartRepository;
    VehiclePartService vehiclePartService;
    MaintenanceCostService maintenanceCostService;

    @Override
    public PageResponse<MaintenanceRecordResponse> searchMaintenanceRecordByMaintenanceManagement(UUID maintenanceManagementId, String keyword, Pageable pageable) {
        MaintenanceManagementEntity maintenanceManagement = maintenanceManagementRepository.findByMaintenanceManagementIdAndIsDeletedFalse(maintenanceManagementId);
        if(maintenanceManagement == null){
            log.info(MaintenanceManagementConstants.LOG_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND + maintenanceManagementId);
            throw new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND);
        }
        Page<MaintenanceRecordEntity> maintenanceRecordEntityPage;

        if(keyword != null && !keyword.isEmpty()){
            maintenanceRecordEntityPage = maintenanceRecordRepository.findByManagementIdAndKeyword(maintenanceManagementId, keyword, pageable);
        } else {
            maintenanceRecordEntityPage = maintenanceRecordRepository.findByManagementId(maintenanceManagementId, pageable);
        }

        if (maintenanceRecordEntityPage.getTotalElements() < 0) {
            log.warn(MaintenanceRecordConstants.LOG_ERR_NO_MAINTENANCE_RECORD_FOUND_FOR_MANAGEMENT + maintenanceManagementId);
            throw new ResourceNotFoundException(MaintenanceRecordConstants.MESSAGE_ERR_NO_MAINTENANCE_RECORD_FOUND_FOR_MANAGEMENT);
        }

        List<MaintenanceRecordResponse> maintenanceRecordResponses = maintenanceRecordEntityPage.map(
                maintenanceRecordEntity -> {
                    MaintenanceRecordResponse maintenanceRecordResponse = maintenanceRecordMapper.toResponse(maintenanceRecordEntity);
                    VehiclePartEntity vehiclePartEntity = maintenanceRecordEntity.getVehiclePart();
                    if(vehiclePartEntity != null){

                        // Set thông tin phụ tùng
                        VehiclePartResponse vehiclePartResponse = VehiclePartResponse.builder()
                                .vehiclePartId(vehiclePartEntity.getVehiclePartId())
                                .vehiclePartName(vehiclePartEntity.getVehiclePartName())
                                .unitPrice(vehiclePartEntity.getUnitPrice())
                                .build();
                        maintenanceRecordResponse.setVehiclePartResponse(vehiclePartResponse);
                    }
                    return maintenanceRecordResponse;
                }
        ).getContent();

        log.info(MaintenanceRecordConstants.LOG_INFO_SHOWING_MAINTENANCE_RECORD_LIST_BY_MAINTENANCE_MANAGEMENT_ID + maintenanceManagementId);
        return PageResponse.<MaintenanceRecordResponse>builder()
                .data(maintenanceRecordResponses)
                .page(maintenanceRecordEntityPage.getNumber())
                .totalElements(maintenanceRecordEntityPage.getTotalElements())
                .totalPages(maintenanceRecordEntityPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public void addMaintenanceRecordsForMaintenanceManagement(
            MaintenanceManagementEntity maintenanceManagementEntity,
            List<CreationMaintenanceRecordRequest> creationMaintenanceRecordRequests) {

        if (creationMaintenanceRecordRequests == null || creationMaintenanceRecordRequests.isEmpty()) {
            log.warn(MaintenanceRecordConstants.LOG_ERR_CREATION_MAINTENANCE_RECORD_LIST_NOT_FOUND);
            throw new ResourceNotFoundException(MaintenanceRecordConstants.MESSAGE_ERR_CREATION_MAINTENANCE_RECORD_LIST_NOT_FOUND);
        }

        if (maintenanceManagementEntity == null) {
            log.warn(MaintenanceManagementConstants.LOG_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND);
            throw new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND);
        }

        for (CreationMaintenanceRecordRequest creationMaintenanceRecordRequest : creationMaintenanceRecordRequests) {

            // Lấy phụ tùng theo ID
            UUID vehiclePartId = creationMaintenanceRecordRequest.getVehiclePartInventoryId();
            VehiclePartEntity vehiclePart = vehiclePartRepository
                    .findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(vehiclePartId);
            if (vehiclePart == null) {
                log.warn(MaintenanceRecordConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + vehiclePartId);
                throw new ResourceNotFoundException(MaintenanceRecordConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
            }

            // Kiểm tra xem phụ tùng này đã có trong record chưa
            MaintenanceRecordEntity existedRecord = maintenanceRecordRepository.findByManagementIdAndVehiclePartIdAndIsDeletedFalse(maintenanceManagementEntity.getMaintenanceManagementId(), vehiclePartId);

            if (existedRecord != null) {
                // Nếu đã có thì chỉ cập nhật số lượng
                int oldQuantity = existedRecord.getQuantityUsed();
                int additionalQuantity = creationMaintenanceRecordRequest.getQuantityUsed();
                existedRecord.setQuantityUsed(oldQuantity + additionalQuantity);
                maintenanceRecordRepository.save(existedRecord);

                log.info(MaintenanceRecordConstants.LOG_INFO_UPDATE_EXISTING_PART_QUANTITY,
                        vehiclePart.getVehiclePartName(), oldQuantity, oldQuantity + additionalQuantity,
                        maintenanceManagementEntity.getMaintenanceManagementId()
                );

            } else {
                // Nếu chưa có thì tạo mới record
                MaintenanceRecordEntity newRecord = maintenanceRecordMapper.toEntity(creationMaintenanceRecordRequest);
                newRecord.setMaintenanceManagement(maintenanceManagementEntity);
                newRecord.setVehiclePart(vehiclePart);
                newRecord.setQuantityUsed(creationMaintenanceRecordRequest.getQuantityUsed());

                String search = UtilFunction.concatenateSearchField(vehiclePart.getSearch(), maintenanceManagementEntity.getSearch());
                newRecord.setSearch(search);

                maintenanceRecordRepository.save(newRecord);
                log.info(MaintenanceRecordConstants.LOG_INFO_CREATING_MAINTENANCE_RECORD_BY_APPOINTMENT,
                        maintenanceManagementEntity.getServiceType().getServiceName());
            }
        }

        // Cập nhật lại tổng chi phí
        maintenanceManagementRepository.flush();
        maintenanceCostService.updateTotalCost(maintenanceManagementEntity);
    }

    @Override
    @Transactional
    public void addMaintenanceRecords(UUID maintenanceManagementID, CreationMaintenanceRecordRequest creationMaintenanceRecordRequest) {
        // ===== 1. Kiểm tra maintenance management tồn tại =====
        MaintenanceManagementEntity maintenanceManagement = maintenanceManagementRepository
                .findByMaintenanceManagementIdAndIsDeletedFalse(maintenanceManagementID);
        if (maintenanceManagement == null) {
            log.warn(MaintenanceManagementConstants.LOG_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND + maintenanceManagementID);
            throw new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND);
        }

        // ===== 2. Lấy phụ tùng =====
        UUID vehiclePartId = creationMaintenanceRecordRequest.getVehiclePartInventoryId();
        VehiclePartEntity vehiclePart = vehiclePartRepository
                .findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(vehiclePartId);
        if (vehiclePart == null) {
            log.warn(MaintenanceRecordConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + vehiclePartId);
            throw new ResourceNotFoundException(MaintenanceRecordConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        Integer quantityUsed = creationMaintenanceRecordRequest.getQuantityUsed();
        if (vehiclePart.getCurrentQuantity() < quantityUsed) {
            log.warn(VehiclePartConstants.LOG_ERR_INSUFFICIENT_VEHICLE_PART_STOCK + vehiclePart.getVehiclePartName());
            throw new EntityValidationException(VehiclePartConstants.MESSAGE_ERR_INSUFFICIENT_VEHICLE_PART_STOCK);
        }

        // ===== 3. Kiểm tra xem phụ tùng này đã tồn tại trong danh sách record chưa =====
        MaintenanceRecordEntity existingRecord = maintenanceRecordRepository.findByManagementIdAndVehiclePartIdAndIsDeletedFalse(maintenanceManagementID, vehiclePartId);

        if (existingRecord != null) {
            existingRecord.setQuantityUsed(existingRecord.getQuantityUsed() + quantityUsed);
            log.info(MaintenanceRecordConstants.LOG_SUCCESS_UPDATING_QUANTITY_FOR_EXISTED_MAINTENANCE_RECORD, vehiclePart.getVehiclePartName());
            maintenanceRecordRepository.save(existingRecord);

            // Trừ đúng phần thêm mới, không trừ toàn bộ
            vehiclePartService.subtractQuantity(vehiclePart.getVehiclePartId(), quantityUsed);
        } else {
            MaintenanceRecordEntity newRecord = maintenanceRecordMapper.toEntity(creationMaintenanceRecordRequest);
            newRecord.setMaintenanceManagement(maintenanceManagement);
            newRecord.setVehiclePart(vehiclePart);
            newRecord.setQuantityUsed(quantityUsed);

            log.info(MaintenanceRecordConstants.LOG_INFO_CREATING_MAINTENANCE_RECORD, vehiclePart.getVehiclePartName());
            maintenanceRecordRepository.save(newRecord);

            vehiclePartService.subtractQuantity(vehiclePart.getVehiclePartId(), quantityUsed);
        }

        // Cập nhật lại giá sau khi thêm phiếu bảo dưỡng khác
        maintenanceManagementRepository.flush();
        maintenanceCostService.updateTotalCost(maintenanceManagement);
    }

    @Override
    @Transactional
    public boolean updateMaintenanceRecord(UUID id, UpdationMaintenanceRecordRequest updationMaintenanceRecordRequest) {
        MaintenanceRecordEntity maintenanceRecordEntity = getMaintenanceRecordEntity(id);

        // Lưu lại thông tin phụ tùng cũ (nếu có)
        VehiclePartEntity oldPart = maintenanceRecordEntity.getVehiclePart();
        int oldQuantity = maintenanceRecordEntity.getQuantityUsed() != null ? maintenanceRecordEntity.getQuantityUsed() : 0;

        // Lấy phụ tùng mới
        UUID vehiclePartInventoryId = updationMaintenanceRecordRequest.getVehiclePartInventoryId();
        VehiclePartEntity newPart = vehiclePartRepository.findVehiclePartEntityByVehiclePartIdAndIsDeletedFalse(vehiclePartInventoryId);
        if (newPart == null) {
            log.warn(MaintenanceRecordConstants.LOG_ERR_VEHICLE_PART_NOT_FOUND + vehiclePartInventoryId);
            throw new ResourceNotFoundException(MaintenanceRecordConstants.MESSAGE_ERR_VEHICLE_PART_NOT_FOUND);
        }

        // Nếu có phụ tùng cũ thì hoàn lại số lượng cũ vào kho
        if (oldPart != null) {
            vehiclePartService.restoreQuantity(oldPart.getVehiclePartId(), oldQuantity);
        }

        // Kiểm tra phụ tùng mới còn đủ hàng không
        Integer newQuantity = updationMaintenanceRecordRequest.getQuantityUsed();
        if (newPart.getCurrentQuantity() < newQuantity) {
            log.warn(VehiclePartConstants.LOG_ERR_INSUFFICIENT_VEHICLE_PART_STOCK + newPart.getVehiclePartName());
            throw new ResourceNotFoundException(VehiclePartConstants.MESSAGE_ERR_INSUFFICIENT_VEHICLE_PART_STOCK);
        }

        // Trừ lượng tồn kho của phụ tùng mới
        vehiclePartService.subtractQuantity(newPart.getVehiclePartId(), newQuantity);

        // Cập nhật lại record
        maintenanceRecordEntity.setVehiclePart(newPart);
        maintenanceRecordEntity.setQuantityUsed(newQuantity);

        maintenanceRecordMapper.toUpdate(maintenanceRecordEntity, updationMaintenanceRecordRequest);
        maintenanceRecordRepository.save(maintenanceRecordEntity);

        // Cập nhật lại tổng chi phí
        MaintenanceManagementEntity maintenanceManagementEntity = maintenanceRecordEntity.getMaintenanceManagement();
        maintenanceManagementRepository.flush();
        maintenanceCostService.updateTotalCost(maintenanceManagementEntity);

        log.info(MaintenanceRecordConstants.LOG_INFO_UPDATING_MAINTENANCE_RECORD + id);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteMaintenanceRecord(UUID id) {
        MaintenanceRecordEntity maintenanceRecordEntity = getMaintenanceRecordEntity(id);

        VehiclePartEntity vehiclePart = maintenanceRecordEntity.getVehiclePart();
        if(vehiclePart != null){
            if(vehiclePartRepository.existsByVehiclePartIdAndIsDeletedFalse(vehiclePart.getVehiclePartId())){
                // Hoàn lại số lượng phụ tùng vào kho
                Integer quantityUsed = maintenanceRecordEntity.getQuantityUsed();
                vehiclePartService.restoreQuantity(vehiclePart.getVehiclePartId(), quantityUsed);
            }
        }

        // Xóa phiếu bảo dưỡng
        maintenanceRecordRepository.delete(maintenanceRecordEntity);

        //Cập nhật lại giá cho management
        MaintenanceManagementEntity maintenanceManagementEntity = maintenanceRecordEntity.getMaintenanceManagement();
        maintenanceManagementRepository.flush();
        maintenanceCostService.updateTotalCost(maintenanceManagementEntity);

        log.info(MaintenanceRecordConstants.LOG_INFO_DELETING_MAINTENANCE_RECORD + id);
        return true;
    }

    private MaintenanceRecordEntity getMaintenanceRecordEntity(UUID id) {
        MaintenanceRecordEntity maintenanceRecordEntity = maintenanceRecordRepository.findByMaintenanceRecordIdAndIsDeletedFalse(id);
        if (maintenanceRecordEntity == null) {
            log.info(MaintenanceRecordConstants.LOG_ERR_MAINTENANCE_RECORD_NOT_FOUND + id);
            throw new ResourceNotFoundException(MaintenanceRecordConstants.MESSAGE_ERR_MAINTENANCE_RECORD_NOT_FOUND);
        }
        return maintenanceRecordEntity;
    }
}
