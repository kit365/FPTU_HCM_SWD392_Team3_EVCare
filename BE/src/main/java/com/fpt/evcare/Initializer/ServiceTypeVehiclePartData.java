package com.fpt.evcare.initializer;
import com.fpt.evcare.entity.*;
import com.fpt.evcare.repository.*;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3)
@Transactional
public class ServiceTypeVehiclePartData implements CommandLineRunner {

    private final ServiceTypeRepository serviceTypeRepository;
    private final VehiclePartRepository vehiclePartRepository;
    private final ServiceTypeVehiclePartRepository serviceTypeVehiclePartRepository;

    @Override
    public void run(String... args) throws Exception {
        if (serviceTypeVehiclePartRepository.count() > 0) {
            log.info("⚙️ ServiceTypeVehiclePart data already initialized.");
            return;
        }

        List<ServiceTypeEntity> serviceTypes = serviceTypeRepository.findAll()
                .stream()
                .filter(s -> s.getParentId() != null && !s.getIsDeleted())
                .collect(Collectors.toList());

        List<VehiclePartEntity> allParts = vehiclePartRepository.findAll()
                .stream()
                .filter(p -> !p.getIsDeleted())
                .collect(Collectors.toList());

        if (serviceTypes.isEmpty() || allParts.isEmpty()) {
            log.warn("❌ Không có service type hoặc vehicle part để khởi tạo ServiceTypeVehiclePart.");
            return;
        }

        List<ServiceTypeVehiclePartEntity> mappingList = new ArrayList<>();

        for (ServiceTypeEntity serviceType : serviceTypes) {
            VehicleTypeEntity serviceVehicleType = serviceType.getVehicleTypeEntity();
            List<VehiclePartEntity> matchingParts = allParts.stream()
                    .filter(p -> p.getVehicleType().getVehicleTypeId().equals(serviceVehicleType.getVehicleTypeId()))
                    .collect(Collectors.toList());

            if (matchingParts.isEmpty()) continue;

            log.info("🔧 Tạo liên kết phụ tùng cho dịch vụ: {}", serviceType.getServiceName());

            // Mỗi dịch vụ lấy ngẫu nhiên 2-3 phụ tùng cùng loại xe
            Collections.shuffle(matchingParts);
            List<VehiclePartEntity> selectedParts = matchingParts.stream()
                    .limit(new Random().nextInt(2) + 2)
                    .collect(Collectors.toList());

            for (VehiclePartEntity part : selectedParts) {
                ServiceTypeVehiclePartEntity entity = ServiceTypeVehiclePartEntity.builder()
                        .serviceType(serviceType)
                        .vehiclePart(part)
                        .requiredQuantity(1 + new Random().nextInt(3)) // từ 1–3
                        .estimatedTimeDefault(30 + new Random().nextInt(60)) // 30–90 phút
                        .build();
                mappingList.add(entity);
            }
        }

        if (!mappingList.isEmpty()) {
            serviceTypeVehiclePartRepository.saveAll(mappingList);
            log.info("✅ Đã khởi tạo {} bản ghi cho ServiceTypeVehiclePartEntity.", mappingList.size());
        } else {
            log.warn("⚠️ Không có bản ghi nào được tạo trong ServiceTypeVehiclePartEntity.");
        }
    }
}
