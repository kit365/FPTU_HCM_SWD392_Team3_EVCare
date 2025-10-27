package com.fpt.evcare.initializer;

import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import com.fpt.evcare.repository.ServiceTypeRepository;
import com.fpt.evcare.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(2)
public class ServiceTypeData implements CommandLineRunner {

    private final ServiceTypeRepository serviceTypeRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    public void run(String... args) {
        if (serviceTypeRepository.count() > 0) {
            log.info("✅ Service types already initialized, skipping...");
            return;
        }

        log.info("🚀 Initializing service types...");

        List<VehicleTypeEntity> vehicleTypeEntities = vehicleTypeRepository.findAll();

        vehicleTypeEntities.forEach(vehicleTypeEntity -> {
            log.info("🚗 Khởi tạo dịch vụ cho xe: {}", vehicleTypeEntity.getVehicleTypeName());

            // === 1. Bảo trì & Sửa chữa ===
            ServiceTypeEntity maintenance = ServiceTypeEntity.builder()
                    .serviceName("Bảo trì & Sửa chữa")
                    .description("Các dịch vụ bảo trì và sửa chữa định kỳ cho xe.")
                    .vehicleTypeEntity(vehicleTypeEntity)
                    .build();
            maintenance = serviceTypeRepository.save(maintenance); // 🔹 phải save trước để có ID

            List<String> maintenanceChildren = List.of(
                    "Thay dầu",
                    "Kiểm tra phanh",
                    "Cân chỉnh bánh xe",
                    "Thay bugi",
                    "Kiểm tra ắc quy",
                    "Thay lọc gió"
            );

            ServiceTypeEntity finalMaintenance = maintenance;
            maintenanceChildren.forEach(name -> {
                ServiceTypeEntity child = ServiceTypeEntity.builder()
                        .serviceName(name)
                        .search(name)
                        .description("Dịch vụ " + name.toLowerCase() + " chuyên nghiệp.")
                        .parentId(finalMaintenance.getServiceTypeId()) // 🔹 có ID cha thật
                        .vehicleTypeEntity(vehicleTypeEntity)     // 🔹 gán loại xe
                        .build();
                serviceTypeRepository.save(child);
            });

            // === 2. Chăm sóc xe chuyên sâu ===
            ServiceTypeEntity care = ServiceTypeEntity.builder()
                    .serviceName("Chăm sóc xe chuyên sâu")
                    .description("Các dịch vụ giúp xe luôn sạch đẹp và bền màu.")
                    .vehicleTypeEntity(vehicleTypeEntity)
                    .build();
            care = serviceTypeRepository.save(care);

            List<String> careChildren = List.of(
                    "Rửa xe",
                    "Đánh bóng sơn",
                    "Phủ nano",
                    "Vệ sinh nội thất",
                    "Khử mùi ozone"
            );

            ServiceTypeEntity finalCare = care;
            careChildren.forEach(name -> {
                ServiceTypeEntity child = ServiceTypeEntity.builder()
                        .serviceName(name)
                        .description("Dịch vụ " + name.toLowerCase() + " giúp xe sạch và bóng hơn.")
                        .parentId(finalCare.getServiceTypeId())
                        .vehicleTypeEntity(vehicleTypeEntity)
                        .build();
                serviceTypeRepository.save(child);
            });

            // === 3. Dịch vụ khẩn cấp ===
            ServiceTypeEntity emergency = ServiceTypeEntity.builder()
                    .serviceName("Dịch vụ khẩn cấp")
                    .description("Hỗ trợ nhanh chóng khi xe gặp sự cố.")
                    .vehicleTypeEntity(vehicleTypeEntity)
                    .build();
            emergency = serviceTypeRepository.save(emergency);

            List<String> emergencyChildren = List.of(
                    "Cứu hộ 24/7",
                    "Thay lốp lưu động",
                    "Kéo xe",
                    "Nạp bình",
                    "Mở khóa xe"
            );

            ServiceTypeEntity finalEmergency = emergency;
            emergencyChildren.forEach(name -> {
                ServiceTypeEntity child = ServiceTypeEntity.builder()
                        .serviceName(name)
                        .description("Dịch vụ " + name.toLowerCase() + " khi xe gặp sự cố.")
                        .parentId(finalEmergency.getServiceTypeId())
                        .vehicleTypeEntity(vehicleTypeEntity)
                        .build();
                serviceTypeRepository.save(child);
            });

            log.info("✅ Dịch vụ cho xe '{}' đã được khởi tạo thành công!", vehicleTypeEntity.getVehicleTypeName());
        });

    }
}