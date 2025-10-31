package com.fpt.evcare.initializer;

import com.fpt.evcare.dto.request.vehicle_type.CreationVehicleTypeRequest;
import com.fpt.evcare.service.VehicleTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(1)
public class VehicleTypeData implements CommandLineRunner {

    private final VehicleTypeService vehicleTypeService;

    private String brand = "VinFast";

    @Override
    public void run(String... args) throws Exception {
        initVehicleTypes();
    }

    private void initVehicleTypes() {

        // VF e34
        CreationVehicleTypeRequest vfE34 = new CreationVehicleTypeRequest();
        vfE34.setVehicleTypeName("VinFast VF e34");
        vfE34.setManufacturer(brand);
        vfE34.setModelYear(2023);
        vfE34.setBatteryCapacity(42f);
        vfE34.setMaintenanceIntervalKm(10000f);
        vfE34.setMaintenanceIntervalMonths(12);
        vfE34.setDescription("Mẫu SUV điện cỡ C đầu tiên của VinFast, pin 42kWh, tầm hoạt động 318 km.");
        vehicleTypeService.addVehicleType(vfE34);

        // VF 8
        CreationVehicleTypeRequest vf8 = new CreationVehicleTypeRequest();
        vf8.setVehicleTypeName("VinFast VF 8");
        vf8.setManufacturer(brand);
        vf8.setModelYear(2024);
        vf8.setBatteryCapacity(82f);
        vf8.setMaintenanceIntervalKm(15000f);
        vf8.setMaintenanceIntervalMonths(12);
        vf8.setDescription("Mẫu SUV điện hạng D, pin 82kWh, hỗ trợ ADAS, tầm hoạt động lên đến 471 km.");
        vehicleTypeService.addVehicleType(vf8);

        // VF 9
        CreationVehicleTypeRequest vf9 = new CreationVehicleTypeRequest();
        vf9.setVehicleTypeName("VinFast VF 9");
        vf9.setManufacturer(brand);
        vf9.setModelYear(2024);
        vf9.setBatteryCapacity(92f);
        vf9.setMaintenanceIntervalKm(20000f);
        vf9.setMaintenanceIntervalMonths(12);
        vf9.setDescription("SUV điện 7 chỗ hạng E của VinFast, pin 92kWh, tầm hoạt động 594 km.");
        vehicleTypeService.addVehicleType(vf9);
    }
}