package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.MaintenanceManagementConstants;
import com.fpt.evcare.entity.MaintenanceManagementEntity;
import com.fpt.evcare.entity.MaintenanceRecordEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.repository.MaintenanceManagementRepository;
import com.fpt.evcare.service.MaintenanceCostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MaintenanceCostServiceImpl implements MaintenanceCostService {

    MaintenanceManagementRepository maintenanceManagementRepository;

    @Override
    @Transactional
    public void updateTotalCost(MaintenanceManagementEntity maintenanceManagementEntity) {
        if (maintenanceManagementEntity == null) {
            log.warn(MaintenanceManagementConstants.LOG_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND);
            throw new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND);
        }

        UUID maintenanceManagementId = maintenanceManagementEntity.getMaintenanceManagementId();

        // 🔥 Lấy danh sách record trực tiếp từ DB (đảm bảo cập nhật mới nhất)
        List<MaintenanceRecordEntity> records =
                maintenanceManagementRepository.findById(maintenanceManagementId)
                        .orElseThrow(() -> new ResourceNotFoundException(MaintenanceManagementConstants.MESSAGE_ERR_MAINTENANCE_MANAGEMENT_NOT_FOUND))
                        .getMaintenanceRecords();

        // 🔥 Nếu vẫn null hoặc trống
        if (records == null || records.isEmpty()) {
            maintenanceManagementEntity.setTotalCost(BigDecimal.ZERO);
            maintenanceManagementRepository.save(maintenanceManagementEntity);
            log.info(MaintenanceManagementConstants.LOG_INFO_UPDATION_TOTAL_COST, maintenanceManagementId);
            return;
        }

        BigDecimal totalCost = records.stream()
                .filter(record ->
                        Boolean.TRUE.equals(record.getApprovedByUser()) &&
                                record.getVehiclePart() != null &&
                                record.getQuantityUsed() != null)
                .map(record ->
                        record.getVehiclePart().getUnitPrice()
                                .multiply(BigDecimal.valueOf(record.getQuantityUsed())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        maintenanceManagementEntity.setTotalCost(totalCost);
        maintenanceManagementRepository.save(maintenanceManagementEntity);

        // 🔥 Ép flush để commit ngay giá trị mới xuống DB
        maintenanceManagementRepository.flush();

        log.info(MaintenanceManagementConstants.LOG_INFO_UPDATION_TOTAL_COST, maintenanceManagementId);
    }
}

