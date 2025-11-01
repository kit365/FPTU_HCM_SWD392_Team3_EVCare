package com.fpt.evcare.initializer;

import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.AppointmentStatusEnum;
import com.fpt.evcare.enums.InvoiceStatusEnum;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.enums.ServiceModeEnum;
import com.fpt.evcare.repository.*;
import com.fpt.evcare.utils.UtilFunction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DataInitializer để tạo test data cho VNPay payment testing
 * 
 * Flow:
 * 1. Tạo customer (nếu chưa có)
 * 2. Tạo appointment với status PENDING_PAYMENT
 * 3. Tạo invoice với status PENDING
 * 
 * Sử dụng: Login as ADMIN/STAFF -> Navigate to /admin/invoice/{appointmentId} -> Test VNPay payment
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(200) // Chạy sau các initializer khác (users, roles, service types, vehicle types)
@Transactional
public class VnPayTestDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    @Override
    public void run(String... args) {
        // Chỉ tạo nếu chưa có appointment test VNPay
        boolean exists = appointmentRepository.findAll().stream()
                .anyMatch(a -> "customer_test_vnpay@test.com".equals(a.getCustomerEmail()));
        
        if (exists) {
            log.info("✅ VNPay test appointment already exists, skipping creation...");
            return;
        }

        log.info("🚀 Creating VNPay test data...");

        try {
            // 1. Tạo hoặc lấy customer - check cả deleted users để tránh duplicate
            UserEntity customer = userRepository.findByEmailAndIsDeletedFalse("customer_test_vnpay@test.com");
            if (customer == null) {
                // Check xem email đã tồn tại chưa (kể cả deleted)
                boolean emailExists = userRepository.existsByEmail("customer_test_vnpay@test.com");
                if (emailExists) {
                    log.warn("⚠️ Email customer_test_vnpay@test.com already exists (possibly deleted). Skipping user creation.");
                    return;
                }
                
                RoleEntity customerRole = roleRepository.findByRoleName(RoleEnum.CUSTOMER);
                if (customerRole == null) {
                    log.error("❌ Customer role not found. Please run RoleAndUserData initializer first.");
                    return;
                }
                
                customer = new UserEntity();
                customer.setUsername("customer_test_vnpay@test.com");
                customer.setEmail("customer_test_vnpay@test.com");
                customer.setPassword("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"); // password: "password"
                customer.setFullName("Khách hàng Test VNPay");
                customer.setRole(customerRole);
                customer.setIsActive(true);
                customer.setIsDeleted(false);
                customer.setCreatedBy("System");
                customer.setUpdatedBy("System");
                customer.setSearch(UtilFunction.concatenateSearchField(
                        "Khách hàng Test VNPay",
                        "",
                        "customer_test_vnpay@test.com",
                        "customer_test_vnpay@test.com"
                ));
                customer = userRepository.save(customer);
                log.info("✅ Created test customer: {}", customer.getEmail());
            }

            // 2. Lấy vehicle type và service type
            VehicleTypeEntity vehicleType = vehicleTypeRepository.findAll().stream()
                    .filter(v -> !v.getIsDeleted())
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No vehicle types found"));

            ServiceTypeEntity serviceType = serviceTypeRepository.findAll().stream()
                    .filter(s -> !s.getIsDeleted() && s.getParentId() == null)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No service types found"));

            // 3. Tạo appointment với status PENDING_PAYMENT
            AppointmentEntity appointment = new AppointmentEntity();
            appointment.setCustomer(customer);
            appointment.setCustomerFullName(customer.getFullName());
            appointment.setCustomerEmail(customer.getEmail());
            appointment.setCustomerPhoneNumber("0123456789");
            appointment.setVehicleTypeEntity(vehicleType);
            appointment.setServiceMode(ServiceModeEnum.STATIONARY);
            appointment.setScheduledAt(LocalDateTime.now().plusDays(1)); // Ngày mai
            appointment.setQuotePrice(new BigDecimal("500000.00"));
            appointment.setStatus(AppointmentStatusEnum.PENDING_PAYMENT);
            appointment.setIsActive(true);
            appointment.setIsDeleted(false);
            appointment.setCreatedBy("System");
            appointment.setUpdatedBy("System");
            appointment.setSearch(UtilFunction.concatenateSearchField(
                    customer.getFullName(),
                    customer.getEmail(),
                    "0123456789"
            ));

            appointment = appointmentRepository.save(appointment);

            // Link service type to appointment
            appointment.getServiceTypeEntities().add(serviceType);
            appointmentRepository.save(appointment);

            log.info("✅ Created test appointment: {} (status: PENDING_PAYMENT)", appointment.getAppointmentId());

            // 4. Tạo invoice với status PENDING
            InvoiceEntity invoice = new InvoiceEntity();
            invoice.setAppointment(appointment);
            invoice.setTotalAmount(new BigDecimal("500000.00"));
            invoice.setPaidAmount(BigDecimal.ZERO);
            invoice.setStatus(InvoiceStatusEnum.PENDING);
            invoice.setInvoiceDate(LocalDateTime.now());
            invoice.setDueDate(LocalDateTime.now().plusDays(7));
            invoice.setNotes("Test invoice for VNPay payment");
            invoice.setIsActive(true);
            invoice.setIsDeleted(false);
            invoice.setCreatedBy("System");
            invoice.setUpdatedBy("System");
            invoice.setSearch(UtilFunction.concatenateSearchField(
                    customer.getEmail(),
                    customer.getFullName(),
                    "invoice"
            ));

            invoice = invoiceRepository.save(invoice);

            log.info("✅ Created test invoice: {} (status: PENDING)", invoice.getInvoiceId());

            log.info("");
            log.info("═══════════════════════════════════════════════════════════════");
            log.info("✅ VNPay Test Data Created Successfully!");
            log.info("═══════════════════════════════════════════════════════════════");
            log.info("📋 Customer Email: customer_test_vnpay@test.com");
            log.info("📅 Appointment ID: {}", appointment.getAppointmentId());
            log.info("💰 Invoice ID: {}", invoice.getInvoiceId());
            log.info("🔗 Appointment Status: PENDING_PAYMENT");
            log.info("🔗 Invoice Status: PENDING");
            log.info("");
            log.info("📍 Next Steps:");
            log.info("1. Login as ADMIN or STAFF");
            log.info("2. Navigate to: /admin/invoice/{}", appointment.getAppointmentId());
            log.info("3. Click 'Thanh toán' button");
            log.info("4. Select 'VNPAY' payment method");
            log.info("5. Click 'Thanh toán' to test VNPay flow");
            log.info("═══════════════════════════════════════════════════════════════");

        } catch (Exception e) {
            log.error("❌ Error creating VNPay test data: {}", e.getMessage(), e);
        }
    }
}

