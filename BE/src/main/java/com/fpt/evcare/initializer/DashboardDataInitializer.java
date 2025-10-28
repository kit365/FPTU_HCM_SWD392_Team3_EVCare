package com.fpt.evcare.initializer;

import com.fpt.evcare.entity.*;
import com.fpt.evcare.enums.*;
import com.fpt.evcare.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(10) // Run after other initializers
@Transactional
public class DashboardDataInitializer implements CommandLineRunner {

    private final AppointmentRepository appointmentRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserRepository userRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    private final Random random = new Random();

    @Override
    public void run(String... args) {
        recreateDashboardData();
    }
    
    public void recreateDashboardData() {
        // Check and clean existing sample data
        long existingCount = appointmentRepository.count();
        if (existingCount > 0) {
            log.info("🗑️ Found {} existing appointments. Cleaning up old sample data...", existingCount);
            
            // Delete all payment transactions first (foreign key constraint)
            long paymentCount = paymentTransactionRepository.count();
            if (paymentCount > 0) {
                paymentTransactionRepository.deleteAll();
                log.info("✅ Deleted {} payment transactions", paymentCount);
            }
            
            // Delete all appointments
            appointmentRepository.deleteAll();
            log.info("✅ Deleted {} appointments", existingCount);
            log.info("🔄 Recreating dashboard sample data...");
        } else {
            log.info("🚀 Initializing dashboard sample data...");
        }

        try {
            // Get required entities (use many customers/technicians to avoid duplicate data)
            List<UserEntity> customers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && u.getRole().getRoleName() == RoleEnum.CUSTOMER)
                    .limit(100)  // Use 100 customers for diverse sample data
                    .toList();

            List<UserEntity> technicians = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && u.getRole().getRoleName() == RoleEnum.TECHNICIAN)
                    .limit(20)  // Use 20 technicians for diverse sample data
                    .toList();

            List<ServiceTypeEntity> serviceTypes = serviceTypeRepository.findAll().stream()
                    .filter(st -> st.getIsDeleted() == null || !st.getIsDeleted())
                    .limit(5)
                    .toList();

            List<VehicleTypeEntity> vehicleTypes = vehicleTypeRepository.findAll().stream()
                    .filter(vt -> vt.getIsDeleted() == null || !vt.getIsDeleted())
                    .limit(3)
                    .toList();

            if (customers.isEmpty()) {
                log.warn("⚠️ No customers found. Please run RoleAndUserData initializer first.");
                return;
            }

            if (serviceTypes.isEmpty()) {
                log.warn("⚠️ No service types found. Please run ServiceTypeData initializer first.");
                return;
            }

            if (vehicleTypes.isEmpty()) {
                log.warn("⚠️ No vehicle types found. Please run VehicleTypeData initializer first.");
                return;
            }

            log.info("📊 Creating sample appointments (up to current month only)...");
            List<AppointmentEntity> appointments = new ArrayList<>();

            // Create appointments only for months up to current month (don't create future data)
            int currentYear = LocalDateTime.now().getYear();
            int currentMonth = LocalDateTime.now().getMonthValue();
            int[] appointmentsPerMonth = {45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 89};
            
            for (int month = 1; month <= currentMonth; month++) {
                int count = appointmentsPerMonth[month - 1];
                
                for (int i = 0; i < count; i++) {
                    // Ensure first 70% are COMPLETED for consistent payment data
                    boolean forceCompleted = i < (count * 0.7);
                    
                    AppointmentEntity appointment = createSampleAppointment(
                            currentYear, month, customers, technicians, serviceTypes, vehicleTypes, forceCompleted
                    );
                    appointments.add(appointment);
                }
                
                log.info("✅ Created {} appointments for month {}, {} will be COMPLETED", 
                        count, month, (int)(count * 0.7));
            }

            // Save all appointments
            List<AppointmentEntity> savedAppointments = appointmentRepository.saveAll(appointments);
            log.info("✅ Created {} sample appointments", savedAppointments.size());

            // Create payment transactions for completed appointments
            log.info("💰 Creating sample payment transactions...");
            List<PaymentTransactionEntity> payments = new ArrayList<>();
            java.util.Map<PaymentTransactionEntity, LocalDateTime> paymentScheduledDates = new java.util.HashMap<>();
            
            for (AppointmentEntity appointment : savedAppointments) {
                if (appointment.getStatus() == AppointmentStatusEnum.COMPLETED) {
                    PaymentTransactionEntity payment = createSamplePayment(appointment);
                    payments.add(payment);
                    // Store the scheduled date with payment object as key (ID not yet generated)
                    paymentScheduledDates.put(payment, appointment.getScheduledAt());
                }
            }
            
            // Save all payments at once (IDs will be generated)
            List<PaymentTransactionEntity> savedPayments = paymentTransactionRepository.saveAll(payments);
            log.info("✅ Created {} sample payment transactions", savedPayments.size());
            
            // Log payment distribution by appointment scheduled month
            java.util.Map<Integer, Long> paymentsByMonth = new java.util.HashMap<>();
            for (PaymentTransactionEntity payment : savedPayments) {
                LocalDateTime scheduledDate = paymentScheduledDates.get(payment);
                if (scheduledDate != null) {
                    int month = scheduledDate.getMonthValue();
                    paymentsByMonth.merge(month, 1L, Long::sum);
                }
            }
            log.info("📊 Payment distribution by appointment scheduled month: {}", paymentsByMonth);
            log.info("💡 Note: Revenue query now uses appointment.scheduled_at instead of payment.created_at");
            log.info("🎉 Dashboard sample data initialization completed!");

        } catch (Exception e) {
            log.error("❌ Error initializing dashboard sample data: {}", e.getMessage(), e);
        }
    }

    private AppointmentEntity createSampleAppointment(
            int year, int month,
            List<UserEntity> customers,
            List<UserEntity> technicians,
            List<ServiceTypeEntity> serviceTypes,
            List<VehicleTypeEntity> vehicleTypes,
            boolean forceCompleted
    ) {
        // Random day in the month
        int day = random.nextInt(28) + 1; // Safe for all months
        int hour = random.nextInt(10) + 8; // 8 AM to 6 PM
        LocalDateTime scheduledAt = LocalDateTime.of(year, month, day, hour, 0);

        // Random customer
        UserEntity customer = customers.get(random.nextInt(customers.size()));

        // Status assignment - force COMPLETED for first 70% to ensure consistent payment data across all months
        AppointmentStatusEnum status;
        if (forceCompleted) {
            status = AppointmentStatusEnum.COMPLETED;
        } else {
            // Random status for remaining 30%
            int statusRand = random.nextInt(100);
            if (statusRand < 50) {
                status = AppointmentStatusEnum.CONFIRMED;
            } else if (statusRand < 73) {
                status = AppointmentStatusEnum.IN_PROGRESS;
            } else if (statusRand < 90) {
                status = AppointmentStatusEnum.PENDING;
            } else {
                status = AppointmentStatusEnum.CANCELLED;
            }
        }

        // Random vehicle type
        VehicleTypeEntity vehicleType = vehicleTypes.get(random.nextInt(vehicleTypes.size()));

        // Random service types (1-3 services per appointment)
        int numServices = random.nextInt(3) + 1;
        List<ServiceTypeEntity> selectedServices = new ArrayList<>();
        for (int i = 0; i < numServices; i++) {
            ServiceTypeEntity service = serviceTypes.get(random.nextInt(serviceTypes.size()));
            if (!selectedServices.contains(service)) {
                selectedServices.add(service);
            }
        }

        // Random quote price
        BigDecimal quotePrice = BigDecimal.valueOf(500000 + random.nextInt(3000000)); // 500k - 3.5M VND

        AppointmentEntity appointment = new AppointmentEntity();
        appointment.setCustomer(customer);
        appointment.setCustomerFullName(customer.getFullName());
        appointment.setCustomerPhoneNumber(customer.getNumberPhone());
        appointment.setCustomerEmail(customer.getEmail());
        appointment.setScheduledAt(scheduledAt);
        appointment.setStatus(status);
        appointment.setServiceMode(random.nextBoolean() ? ServiceModeEnum.STATIONARY : ServiceModeEnum.MOBILE);
        appointment.setVehicleTypeEntity(vehicleType);
        appointment.setVehicleNumberPlate(generateRandomPlate());
        appointment.setVehicleKmDistances(String.valueOf(random.nextInt(100000) + 10000));
        appointment.setUserAddress(customer.getAddress());
        appointment.setQuotePrice(quotePrice);
        appointment.setServiceTypeEntities(selectedServices);
        appointment.setNotes("Sample appointment for month " + month);
        appointment.setSearch(customer.getFullName() + " " + customer.getNumberPhone());

        // Assign technician for confirmed/in-progress/completed
        if (status != AppointmentStatusEnum.PENDING && status != AppointmentStatusEnum.CANCELLED && !technicians.isEmpty()) {
            appointment.setTechnicianEntities(List.of(technicians.get(random.nextInt(technicians.size()))));
        }

        return appointment;
    }

    private PaymentTransactionEntity createSamplePayment(AppointmentEntity appointment) {
        BigDecimal amount = appointment.getQuotePrice() != null 
                ? appointment.getQuotePrice() 
                : BigDecimal.valueOf(1000000);

        return PaymentTransactionEntity.builder()
                .appointment(appointment)
                .gateway(PaymentGatewayEnum.VNPAY)
                .amount(amount)
                .currency("VND")
                .transactionReference("SAMPLE_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status(PaymentTransactionStatusEnum.SUCCESS)
                .transactionResponse("Sample payment transaction")
                .build();
    }

    private String generateRandomPlate() {
        String[] cities = {"29", "30", "51", "59", "92"};
        String city = cities[random.nextInt(cities.length)];
        String letter = String.valueOf((char) ('A' + random.nextInt(26)));
        int number = random.nextInt(90000) + 10000;
        return city + letter + "-" + number;
    }
}


