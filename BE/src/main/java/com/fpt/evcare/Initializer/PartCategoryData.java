package com.fpt.evcare.initializer;

import com.fpt.evcare.service.VehiclePartCategoryService;
import com.fpt.evcare.dto.request.vehicle_part_category.CreationVehiclePartCategoryRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PartCategoryData implements CommandLineRunner {

    private final VehiclePartCategoryService vehiclePartCategoryService;

    @Override
    public void run(String... args) throws Exception {
        initVehiclePartCategories();
    }

    private void initVehiclePartCategories() {
        // Pin
        CreationVehiclePartCategoryRequest battery = new CreationVehiclePartCategoryRequest();
        battery.setPartCategoryName("Pin xe điện");
        battery.setDescription("Dung lượng pin dùng để lưu trữ và cung cấp năng lượng cho xe điện.");
        battery.setAverageLifespan(8); // 8 năm
        vehiclePartCategoryService.createVehiclePartCategory(battery);

        // Động cơ điện
        CreationVehiclePartCategoryRequest motor = new CreationVehiclePartCategoryRequest();
        motor.setPartCategoryName("Động cơ điện");
        motor.setDescription("Động cơ điện truyền động trực tiếp, công suất từ 110kW - 300kW.");
        motor.setAverageLifespan(15);
        vehiclePartCategoryService.createVehiclePartCategory(motor);

        // Bộ sạc
        CreationVehiclePartCategoryRequest charger = new CreationVehiclePartCategoryRequest();
        charger.setPartCategoryName("Bộ sạc");
        charger.setDescription("Bộ sạc nhanh/ chậm cho pin xe điện.");
        charger.setAverageLifespan(10);
        vehiclePartCategoryService.createVehiclePartCategory(charger);

        // Hệ thống phanh
        CreationVehiclePartCategoryRequest brake = new CreationVehiclePartCategoryRequest();
        brake.setPartCategoryName("Hệ thống phanh");
        brake.setDescription("Phanh đĩa và phanh tái tạo năng lượng cho xe điện.");
        brake.setAverageLifespan(7);
        vehiclePartCategoryService.createVehiclePartCategory(brake);
    }


}
