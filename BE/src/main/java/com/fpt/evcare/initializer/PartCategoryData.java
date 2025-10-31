package com.fpt.evcare.initializer;

import com.fpt.evcare.service.VehiclePartCategoryService;
import com.fpt.evcare.dto.request.vehicle_part_category.CreationVehiclePartCategoryRequest;
import com.fpt.evcare.repository.VehiclePartCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(1)
public class PartCategoryData implements CommandLineRunner {

    private final VehiclePartCategoryService vehiclePartCategoryService;
    private final VehiclePartCategoryRepository vehiclePartCategoryRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if vehicle part categories already exist
        if (vehiclePartCategoryRepository.count() > 0) {
            log.info("✅ Vehicle part categories already initialized, skipping...");
            return;
        }

        log.info("🚀 Initializing vehicle part categories...");
        initVehiclePartCategories();
    }

    private void initVehiclePartCategories() {
        // Pin
        CreationVehiclePartCategoryRequest battery = new CreationVehiclePartCategoryRequest();
        battery.setPartCategoryName("Pin xe điện");
        battery.setDescription("Dung lượng pin dùng để lưu trữ và cung cấp năng lượng cho xe điện.");
        vehiclePartCategoryService.createVehiclePartCategory(battery);

        // Động cơ điện
        CreationVehiclePartCategoryRequest motor = new CreationVehiclePartCategoryRequest();
        motor.setPartCategoryName("Động cơ điện");
        motor.setDescription("Động cơ điện truyền động trực tiếp, công suất từ 110kW - 300kW.");
        vehiclePartCategoryService.createVehiclePartCategory(motor);

        // Bộ sạc
        CreationVehiclePartCategoryRequest charger = new CreationVehiclePartCategoryRequest();
        charger.setPartCategoryName("Bộ sạc");
        charger.setDescription("Bộ sạc nhanh/ chậm cho pin xe điện.");
        vehiclePartCategoryService.createVehiclePartCategory(charger);

        // Hệ thống phanh
        CreationVehiclePartCategoryRequest brake = new CreationVehiclePartCategoryRequest();
        brake.setPartCategoryName("Hệ thống phanh");
        brake.setDescription("Phanh đĩa và phanh tái tạo năng lượng cho xe điện.");
        vehiclePartCategoryService.createVehiclePartCategory(brake);
    }


}
