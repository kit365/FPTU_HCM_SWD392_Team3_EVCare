package com.fpt.evcare.initializer;

import com.fpt.evcare.dto.request.warranty_part.CreationWarrantyPartRequest;
import com.fpt.evcare.entity.VehiclePartCategoryEntity;
import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import com.fpt.evcare.enums.ValidityPeriodUnitEnum;
import com.fpt.evcare.enums.VehiclePartStatusEnum;
import com.fpt.evcare.enums.WarrantyDiscountTypeEnum;
import com.fpt.evcare.repository.VehiclePartCategoryRepository;
import com.fpt.evcare.repository.VehiclePartRepository;
import com.fpt.evcare.repository.VehicleTypeRepository;
import com.fpt.evcare.service.WarrantyPartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
@Transactional
public class VehiclePartData implements CommandLineRunner {

    private final VehicleTypeRepository vehicleTypeRepository;
    private final VehiclePartCategoryRepository vehiclePartCategoryRepository;
    private final VehiclePartRepository vehiclePartRepository;
    private final WarrantyPartService warrantyPartService;

    @Override
    public void run(String... args) throws Exception {
        // Chỉ skip khi bảng phụ tùng đã có dữ liệu
        if (vehiclePartRepository.count() > 0) {
            log.info("⚙️ Vehicle parts already present, skipping initialization.");
            return;
        }

        List<VehicleTypeEntity> vehicleTypes = vehicleTypeRepository.findAll();
        if (vehicleTypes.isEmpty()) {
            log.warn("No vehicle types found. Skipping vehicle parts initialization.");
            return;
        }

        vehicleTypes.forEach(vehicleType -> {
            log.info("🚗 Khởi tạo phụ tùng cho xe: {}", vehicleType.getVehicleTypeName());

            // === 1. Danh mục: Pin xe điện ===
            List<VehiclePartEntity> batteryParts = createPartsForCategory("Pin xe điện", vehicleType, List.of(
                    new PartData("Pin Lithium-ion 50kWh", 20, 5, BigDecimal.valueOf(15000000), VehiclePartStatusEnum.AVAILABLE, "Pin chính cho xe điện, dung lượng 50kWh", 8),
                    new PartData("Pin Lithium-ion 70kWh", 15, 5, BigDecimal.valueOf(20000000), VehiclePartStatusEnum.AVAILABLE, "Pin chính cho xe điện, dung lượng 70kWh", 8),
                    new PartData("Pin phụ 12V", 30, 10, BigDecimal.valueOf(2500000), VehiclePartStatusEnum.AVAILABLE, "Pin phụ cho hệ thống điện 12V", 5)
            ));
            if (!batteryParts.isEmpty()) {
                List<VehiclePartEntity> savedBatteryParts = vehiclePartRepository.saveAll(batteryParts);
                createWarrantyPartsForVehicleParts(savedBatteryParts);
            }

            // === 2. Danh mục: Động cơ điện ===
            List<VehiclePartEntity> motorParts = createPartsForCategory("Động cơ điện", vehicleType, List.of(
                    new PartData("Động cơ điện 110kW", 25, 5, BigDecimal.valueOf(25000000), VehiclePartStatusEnum.AVAILABLE, "Động cơ điện công suất 110kW", 10),
                    new PartData("Động cơ điện 150kW", 20, 5, BigDecimal.valueOf(30000000), VehiclePartStatusEnum.AVAILABLE, "Động cơ điện công suất 150kW", 10),
                    new PartData("Bộ điều khiển động cơ", 35, 10, BigDecimal.valueOf(8000000), VehiclePartStatusEnum.AVAILABLE, "Bộ điều khiển tốc độ và hiệu suất động cơ", 8),
                    new PartData("Bộ làm mát động cơ", 40, 10, BigDecimal.valueOf(3500000), VehiclePartStatusEnum.AVAILABLE, "Hệ thống làm mát cho động cơ điện", 6)
            ));
            if (!motorParts.isEmpty()) {
                List<VehiclePartEntity> savedMotorParts = vehiclePartRepository.saveAll(motorParts);
                createWarrantyPartsForVehicleParts(savedMotorParts);
            }

            // === 3. Danh mục: Bộ sạc ===
            List<VehiclePartEntity> chargerParts = createPartsForCategory("Bộ sạc", vehicleType, List.of(
                    new PartData("Bộ sạc nhanh DC 50kW", 15, 5, BigDecimal.valueOf(12000000), VehiclePartStatusEnum.AVAILABLE, "Bộ sạc nhanh một chiều 50kW", 8),
                    new PartData("Bộ sạc nhanh DC 150kW", 10, 3, BigDecimal.valueOf(18000000), VehiclePartStatusEnum.AVAILABLE, "Bộ sạc nhanh một chiều 150kW", 8),
                    new PartData("Bộ sạc AC 7.2kW", 25, 10, BigDecimal.valueOf(4500000), VehiclePartStatusEnum.AVAILABLE, "Bộ sạc xoay chiều 7.2kW cho sạc tại nhà", 10),
                    new PartData("Cáp sạc Type 2", 50, 20, BigDecimal.valueOf(1500000), VehiclePartStatusEnum.AVAILABLE, "Cáp sạc chuẩn Type 2 dài 5m", 5)
            ));
            if (!chargerParts.isEmpty()) {
                List<VehiclePartEntity> savedChargerParts = vehiclePartRepository.saveAll(chargerParts);
                createWarrantyPartsForVehicleParts(savedChargerParts);
            }

            // === 4. Danh mục: Hệ thống phanh ===
            List<VehiclePartEntity> brakeParts = createPartsForCategory("Hệ thống phanh", vehicleType, List.of(
                    new PartData("Má phanh tái tạo năng lượng", 45, 10, BigDecimal.valueOf(3500000), VehiclePartStatusEnum.AVAILABLE, "Má phanh có khả năng tái tạo năng lượng", 3),
                    new PartData("Phanh đĩa trước", 40, 10, BigDecimal.valueOf(2500000), VehiclePartStatusEnum.AVAILABLE, "Hệ thống phanh đĩa trước", 3),
                    new PartData("Phanh đĩa sau", 40, 10, BigDecimal.valueOf(2200000), VehiclePartStatusEnum.AVAILABLE, "Hệ thống phanh đĩa sau", 3),
                    new PartData("Dầu phanh DOT 4", 60, 20, BigDecimal.valueOf(300000), VehiclePartStatusEnum.AVAILABLE, "Dầu phanh chuyên dụng cho xe điện", 2)
            ));
            if (!brakeParts.isEmpty()) {
                List<VehiclePartEntity> savedBrakeParts = vehiclePartRepository.saveAll(brakeParts);
                createWarrantyPartsForVehicleParts(savedBrakeParts);
            }

            log.info("✅ Đã khởi tạo phụ tùng cho xe: {}", vehicleType.getVehicleTypeName());
        });
    }

    private List<VehiclePartEntity> createPartsForCategory(String categoryName, VehicleTypeEntity vehicleType, List<PartData> partDataList) {
        // Tìm category theo tên (category đã được tạo bởi PartCategoryData)
        Optional<VehiclePartCategoryEntity> categoryOpt = vehiclePartCategoryRepository.findByPartCategoryName(categoryName);
        if (categoryOpt.isEmpty()) {
            log.warn("⚠️ Category '{}' chưa tồn tại. Vui lòng chạy PartCategoryData trước. Bỏ qua tạo phụ tùng cho category này.", categoryName);
            return new ArrayList<>();
        }

        VehiclePartCategoryEntity category = categoryOpt.get();
        List<VehiclePartEntity> parts = new ArrayList<>();
        
        for (PartData data : partDataList) {
            // Kiểm tra xem phụ tùng đã tồn tại cho vehicle type này chưa
            Optional<VehiclePartEntity> existingPart = vehiclePartRepository.findByVehiclePartNameAndVehicleType(data.name, vehicleType);
            if (existingPart.isPresent()) {
                log.debug("Phụ tùng '{}' đã tồn tại cho xe {}, bỏ qua.", data.name, vehicleType.getVehicleTypeName());
                continue;
            }

            VehiclePartEntity part = VehiclePartEntity.builder()
                    .vehiclePartName(data.name)
                    .currentQuantity(data.currentQuantity)
                    .minStock(data.minStock)
                    .unitPrice(data.unitPrice)
                    .search(data.name + "-" + vehicleType.getVehicleTypeName())
                    .status(data.status)
                    .note(data.note)
                    .averageLifespan(data.lifespan)
                    .vehiclePartCategories(category)
                    .vehicleType(vehicleType)
                    .build();
            parts.add(part);
            log.debug("✅ Đã tạo phụ tùng: {} cho xe {}", data.name, vehicleType.getVehicleTypeName());
        }
        
        return parts;
    }

    /**
     * Tạo warranty part cho danh sách vehicle parts
     * Mặc định: Giảm giá 10% trong 1 năm
     */
    private void createWarrantyPartsForVehicleParts(List<VehiclePartEntity> vehicleParts) {
        for (VehiclePartEntity vehiclePart : vehicleParts) {
            try {
                CreationWarrantyPartRequest warrantyRequest = new CreationWarrantyPartRequest();
                warrantyRequest.setVehiclePartId(vehiclePart.getVehiclePartId());
                warrantyRequest.setDiscountType(WarrantyDiscountTypeEnum.PERCENTAGE);
                warrantyRequest.setDiscountValue(BigDecimal.valueOf(10)); // Giảm giá 10%
                warrantyRequest.setValidityPeriod(1); // 1 năm
                warrantyRequest.setValidityPeriodUnit(ValidityPeriodUnitEnum.YEAR);

                warrantyPartService.createWarrantyPart(warrantyRequest);
                log.info("✅ Đã tạo bảo hành cho phụ tùng: {} (Giảm 10% trong 1 năm)", vehiclePart.getVehiclePartName());
            } catch (Exception e) {
                // Nếu đã có warranty part hoặc lỗi khác, chỉ log warning và tiếp tục
                log.warn("⚠️ Không thể tạo bảo hành cho phụ tùng {}: {}", vehiclePart.getVehiclePartName(), e.getMessage());
            }
        }
    }

    // Record cho dữ liệu mẫu
    record PartData(String name, int currentQuantity, int minStock, BigDecimal unitPrice, VehiclePartStatusEnum status, String note, int lifespan) {}
}
