package com.fpt.evcare.initializer;

import com.fpt.evcare.entity.AppointmentEntity;
import com.fpt.evcare.entity.ShiftEntity;
import com.fpt.evcare.enums.ShiftStatusEnum;
import com.fpt.evcare.enums.ShiftTypeEnum;
import com.fpt.evcare.repository.AppointmentRepository;
import com.fpt.evcare.repository.ShiftRepository;
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

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Order(101) // Chạy sau AppointmentData (Order 100)
public class ShiftData implements CommandLineRunner {

    ShiftRepository shiftRepository;
    AppointmentRepository appointmentRepository;

    @Override
    public void run(String... args) {
        // Chỉ tạo shift test khi chưa có shift nào
        if (shiftRepository.count() > 0) {
            log.info("✅ Shifts already exist, skipping test data creation...");
            return;
        }

        log.info("🚀 Creating test shifts for appointments...");

        try {
            // Lấy tất cả appointments PENDING
            List<AppointmentEntity> pendingAppointments = appointmentRepository.findAll()
                    .stream()
                    .filter(a -> a.getStatus().toString().equals("PENDING"))
                    .toList();

            if (pendingAppointments.isEmpty()) {
                log.warn("⚠️ No pending appointments found, skipping shift creation");
                return;
            }

            int createdCount = 0;
            for (AppointmentEntity appointment : pendingAppointments) {
                createShiftForAppointment(appointment);
                createdCount++;
            }

            log.info("✅ Created {} shifts for pending appointments!", createdCount);

        } catch (Exception e) {
            log.error("❌ Error creating test shifts: {}", e.getMessage());
        }
    }

    private void createShiftForAppointment(AppointmentEntity appointment) {
        // Tạo shift từ thời gian hẹn
        LocalDateTime appointmentTime = appointment.getScheduledAt();
        LocalDateTime shiftStart = appointmentTime.minusHours(1); // Bắt đầu trước 1 tiếng
        LocalDateTime shiftEnd = appointmentTime.plusHours(3); // Dự kiến 3 tiếng (1h chuẩn bị + 2h làm việc)
        
        // Tính total hours
        BigDecimal totalHours = BigDecimal.valueOf(4.0); // 4 giờ mặc định

        ShiftEntity shift = ShiftEntity.builder()
                .appointment(appointment)
                .shiftType(ShiftTypeEnum.APPOINTMENT) // Ca làm cho appointment
                .startTime(shiftStart)
                .endTime(shiftEnd)
                .status(ShiftStatusEnum.PENDING_ASSIGNMENT) // Chưa phân công
                .totalHours(totalHours)
                .notes("Ca làm tự động cho appointment " + appointment.getVehicleNumberPlate())
                .search(appointment.getVehicleNumberPlate() + " " + appointment.getCustomerFullName())
                .technicians(new ArrayList<>()) // Chưa có kỹ thuật viên
                .staff(null) // Chưa có staff
                .assignee(null) // Chưa có người phân công
                .build();

        shiftRepository.save(shift);

        log.info("📅 Created PENDING_ASSIGNMENT shift for appointment: {} ({})", 
                appointment.getVehicleNumberPlate(), 
                shiftStart.toLocalDate());
    }
}

