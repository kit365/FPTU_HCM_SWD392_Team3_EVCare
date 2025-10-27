package com.fpt.evcare.initializer;

import com.fpt.evcare.entity.VehiclePartCategoryEntity;
import com.fpt.evcare.entity.VehiclePartEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import com.fpt.evcare.enums.VehiclePartStatusEnum;
import com.fpt.evcare.repository.VehiclePartCategoryRepository;
import com.fpt.evcare.repository.VehiclePartRepository;
import com.fpt.evcare.repository.VehicleTypeRepository;
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

    @Override
    public void run(String... args) throws Exception {
        if (vehiclePartCategoryRepository.count() > 0) {
            log.info("⚙️ Vehicle parts data already initialized.");
            return;
        }

        List<VehicleTypeEntity> vehicleTypes = vehicleTypeRepository.findAll();
        if (vehicleTypes.isEmpty()) {
            log.warn("No vehicle types found. Skipping vehicle parts initialization.");
            return;
        }

        vehicleTypes.forEach(vehicleType -> {
            log.info("🚗 Khởi tạo phụ tùng cho xe: {}", vehicleType.getVehicleTypeName());

            // === 1. Danh mục: Động cơ ===
            createCategoryIfNotExists("Động cơ", "Các bộ phận thuộc hệ thống động cơ của xe.", vehicleType);
            List<VehiclePartEntity> engineParts = createPartsForCategory("Động cơ", vehicleType, List.of(
                    new PartData("Lọc dầu động cơ", 50, 10, BigDecimal.valueOf(350000), VehiclePartStatusEnum.AVAILABLE, "Thay mỗi 10.000 km", 3),
                    new PartData("Bugi đánh lửa", 80, 15, BigDecimal.valueOf(120000), VehiclePartStatusEnum.AVAILABLE, "Kiểm tra định kỳ", 2),
                    new PartData("Dây curoa", 40, 5, BigDecimal.valueOf(700000), VehiclePartStatusEnum.LOW_STOCK, "Thay khi có tiếng rít", 5)
            ));
            vehiclePartRepository.saveAll(engineParts);

            // === 2. Danh mục: Phanh ===
            createCategoryIfNotExists("Phanh", "Các linh kiện liên quan đến hệ thống phanh của xe.", vehicleType);
            List<VehiclePartEntity> brakeParts = createPartsForCategory("Phanh", vehicleType, List.of(
                    new PartData("Má phanh trước", 60, 10, BigDecimal.valueOf(450000), VehiclePartStatusEnum.AVAILABLE, "Thay khi mòn", 2),
                    new PartData("Má phanh sau", 55, 10, BigDecimal.valueOf(400000), VehiclePartStatusEnum.AVAILABLE, "Thay sau 15.000 km", 2),
                    new PartData("Dầu phanh DOT 4", 100, 20, BigDecimal.valueOf(150000), VehiclePartStatusEnum.AVAILABLE, "Thay mỗi 20.000 km", 3)
            ));
            vehiclePartRepository.saveAll(brakeParts);

            // === 3. Danh mục: Điện & Ắc quy ===
            createCategoryIfNotExists("Điện & Ắc quy", "Các thiết bị điện và hệ thống ắc quy của xe.", vehicleType);
            List<VehiclePartEntity> electricalParts = createPartsForCategory("Điện & Ắc quy", vehicleType, List.of(
                    new PartData("Ắc quy 12V", 25, 5, BigDecimal.valueOf(1800000), VehiclePartStatusEnum.LOW_STOCK, "Thay mỗi 3 năm", 3),
                    new PartData("Cầu chì tổng", 70, 15, BigDecimal.valueOf(50000), VehiclePartStatusEnum.AVAILABLE, "Kiểm tra khi mất điện cục bộ", 5),
                    new PartData("Bóng đèn pha LED", 90, 10, BigDecimal.valueOf(600000), VehiclePartStatusEnum.AVAILABLE, "Bóng LED tuổi thọ cao", 8)
            ));
            vehiclePartRepository.saveAll(electricalParts);

            log.info("✅ Đã khởi tạo phụ tùng cho xe: {}", vehicleType.getVehicleTypeName());
        });
    }

    private void createCategoryIfNotExists(String categoryName, String description) {
        Optional<VehiclePartCategoryEntity> existingCategory = vehiclePartCategoryRepository.findByPartCategoryName(categoryName);
        if (existingCategory.isPresent()) {
            log.info("Danh mục '{}' đã tồn tại, bỏ qua.", categoryName);
            return;
        }

        VehiclePartCategoryEntity category = VehiclePartCategoryEntity.builder()
                .partCategoryName(categoryName)
                .description(description)
                .build();
        vehiclePartCategoryRepository.save(category);
        log.info("✅ Tạo danh mục mới: {}", categoryName);
    }

    private List<VehiclePartEntity> createPartsForCategory(String categoryName, VehicleTypeEntity vehicleType, List<PartData> partDataList) {
        VehiclePartCategoryEntity category = vehiclePartCategoryRepository.findByPartCategoryName(categoryName)
                .orElseThrow(() -> new RuntimeException("Category not found: " + categoryName));

        List<VehiclePartEntity> parts = new ArrayList<>();
        for (PartData data : partDataList) {
            Optional<VehiclePartEntity> existingPart = vehiclePartRepository.findByVehiclePartNameAndVehicleType(data.name, vehicleType);
            if (existingPart.isPresent()) {
                log.info("Phụ tùng '{}' đã tồn tại, bỏ qua.", data.name);
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
                    .note("Phụ tùng " + data.name.toLowerCase() + " cho dòng xe " + vehicleType.getVehicleTypeName())
                    .build();
            parts.add(part);
        }
        return parts;
    }

    // Record cho dữ liệu mẫu
    record PartData(String name, int currentQuantity, int minStock, BigDecimal unitPrice, VehiclePartStatusEnum status, String note, int lifespan) {}
}
