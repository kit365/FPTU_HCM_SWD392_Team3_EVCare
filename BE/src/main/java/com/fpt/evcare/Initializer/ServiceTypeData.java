package com.fpt.evcare.initializer;

import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.repository.ServiceTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ServiceTypeData implements CommandLineRunner {

    private final ServiceTypeRepository serviceTypeRepository;

    @Override
    public void run(String... args) {
        if (serviceTypeRepository.count() > 0) {
            log.info("✅ Service types already initialized, skipping...");
            return;
        }

        log.info("🚀 Initializing service types...");

        // === 1. Bảo trì & Sửa chữa ===
        ServiceTypeEntity maintenance = ServiceTypeEntity.builder()
                .serviceName("Bảo trì & Sửa chữa")
                .description("Các dịch vụ bảo trì và sửa chữa định kỳ cho xe.")
                .isActive(true)
                .build();
        serviceTypeRepository.save(maintenance);

        List<String> maintenanceChildren = List.of(
                "Thay dầu",
                "Kiểm tra phanh",
                "Cân chỉnh bánh xe",
                "Thay bugi",
                "Kiểm tra ắc quy",
                "Thay lọc gió"
        );
        maintenanceChildren.forEach(name ->
                serviceTypeRepository.save(ServiceTypeEntity.builder()
                        .serviceName(name)
                        .description("Dịch vụ " + name.toLowerCase() + " chuyên nghiệp.")
                        .parentId(maintenance.getServiceTypeId())
                        .isActive(true)
                        .build())
        );

        // === 2. Chăm sóc xe chuyên sâu ===
        ServiceTypeEntity care = ServiceTypeEntity.builder()
                .serviceName("Chăm sóc xe chuyên sâu")
                .description("Các dịch vụ giúp xe luôn sạch đẹp và bền màu.")
                .isActive(true)
                .build();
        serviceTypeRepository.save(care);

        List<String> careChildren = List.of(
                "Rửa xe",
                "Đánh bóng sơn",
                "Phủ nano",
                "Vệ sinh nội thất",
                "Khử mùi ozone"
        );
        careChildren.forEach(name ->
                serviceTypeRepository.save(ServiceTypeEntity.builder()
                        .serviceName(name)
                        .description("Dịch vụ " + name.toLowerCase() + " giúp xe sạch và bóng hơn.")
                        .parentId(care.getServiceTypeId())
                        .isActive(true)
                        .build())
        );

        // === 3. Dịch vụ khẩn cấp ===
        ServiceTypeEntity emergency = ServiceTypeEntity.builder()
                .serviceName("Dịch vụ khẩn cấp")
                .description("Hỗ trợ nhanh chóng khi xe gặp sự cố.")
                .isActive(true)
                .build();
        serviceTypeRepository.save(emergency);

        List<String> emergencyChildren = List.of(
                "Cứu hộ 24/7",
                "Thay lốp lưu động",
                "Kéo xe",
                "Nạp bình",
                "Mở khóa xe"
        );
        emergencyChildren.forEach(name ->
                serviceTypeRepository.save(ServiceTypeEntity.builder()
                        .serviceName(name)
                        .description("Dịch vụ " + name.toLowerCase() + " khi xe gặp sự cố.")
                        .parentId(emergency.getServiceTypeId())
                        .isActive(true)
                        .build())
        );

        log.info("✅ Service types initialized successfully!");
    }
}