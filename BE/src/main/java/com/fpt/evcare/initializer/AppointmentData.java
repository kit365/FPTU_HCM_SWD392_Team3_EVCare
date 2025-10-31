package com.fpt.evcare.initializer;

import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.ServiceTypeEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.entity.VehicleTypeEntity;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.ServiceModeEnum;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.ServiceTypeRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.repository.VehicleTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Order(100) // Chạy sau cùng, sau khi users, vehicle types, service types đã được tạo
public class AppointmentData implements CommandLineRunner {

    AppointmentRepository appointmentRepository;
    UserRepository userRepository;
    VehicleTypeRepository vehicleTypeRepository;
    ServiceTypeRepository serviceTypeRepository;

    @Override
    public void run(String... args) {
        // Chỉ tạo appointment test khi chưa có appointment nào
        if (appointmentRepository.count() > 0) {
            log.info("✅ Appointments already exist, skipping test data creation...");
            return;
        }

        log.info("🚀 Creating test appointments...");

        try {
            // Lấy dữ liệu cần thiết
            UserEntity customer = userRepository.findByEmailAndIsDeletedFalse("customer@gmail.com");

            
            List<VehicleTypeEntity> vehicleTypes = vehicleTypeRepository.findAll();
            if (vehicleTypes.isEmpty()) {
                log.warn("⚠️ No vehicle types found, skipping appointment creation");
                return;
            }

            List<ServiceTypeEntity> serviceTypes = serviceTypeRepository.findAll();
            if (serviceTypes.isEmpty()) {
                log.warn("⚠️ No service types found, skipping appointment creation");
                return;
            }

            // Tạo 3 appointments test với trạng thái khác nhau
            createTestAppointment(customer, vehicleTypes.get(0), serviceTypes, 
                AppointmentStatusEnum.PENDING, "30A-11111", 2);
            
            createTestAppointment(customer, vehicleTypes.get(0), serviceTypes, 
                AppointmentStatusEnum.PENDING, "30A-22222", 3);
            
            createTestAppointment(customer, vehicleTypes.get(0), serviceTypes, 
                AppointmentStatusEnum.PENDING, "30A-33333", 5);

            log.info("✅ Test appointments created successfully!");

        } catch (Exception e) {
            log.error("❌ Error creating test appointments: {}", e.getMessage());
        }
    }

    private void createTestAppointment(
            UserEntity customer,
            VehicleTypeEntity vehicleType,
            List<ServiceTypeEntity> allServiceTypes,
            AppointmentStatusEnum status,
            String plateNumber,
            int daysFromNow
    ) {
        Random random = new Random();
        
        // Chọn ngẫu nhiên 1-2 service types
        List<ServiceTypeEntity> selectedServices = new ArrayList<>();
        int serviceCount = random.nextInt(2) + 1; // 1 or 2 services
        for (int i = 0; i < serviceCount && i < allServiceTypes.size(); i++) {
            selectedServices.add(allServiceTypes.get(random.nextInt(allServiceTypes.size())));
        }

        AppointmentEntity appointment = AppointmentEntity.builder()
                .customer(customer)
                .customerFullName(customer.getFullName())
                .customerPhoneNumber(customer.getNumberPhone())
                .customerEmail(customer.getEmail())
                .serviceMode(ServiceModeEnum.STATIONARY) // Tại cửa hàng
                .vehicleTypeEntity(vehicleType)
                .vehicleNumberPlate(plateNumber)
                .vehicleKmDistances(String.valueOf(10000 + random.nextInt(40000))) // 10k-50k km
                .userAddress("123 Đường Test, Quận " + random.nextInt(12) + ", TP.HCM")
                .scheduledAt(LocalDateTime.now().plusDays(daysFromNow).withHour(9 + random.nextInt(8)).withMinute(0)) // 9h-17h
                .quotePrice(new BigDecimal(300000 + random.nextInt(700000))) // 300k-1M
                .status(status)
                .notes("Cuộc hẹn test - Tạo tự động từ DataInitializer")
                .search(customer.getFullName() + " " + customer.getEmail() + " " + customer.getNumberPhone() + " " + plateNumber)
                .serviceTypeEntities(selectedServices)
                .technicianEntities(new ArrayList<>()) // Chưa có kỹ thuật viên
                .assignee(null) // Chưa có người phân công
                .build();

        appointmentRepository.save(appointment);
        
        log.info("📝 Created {} appointment: {} - {}", 
                status, plateNumber, appointment.getCustomerFullName());
    }
}

