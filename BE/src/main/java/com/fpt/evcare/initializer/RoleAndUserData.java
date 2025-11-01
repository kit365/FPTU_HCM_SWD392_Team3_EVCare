package com.fpt.evcare.initializer;

import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Order(2)
public class RoleAndUserData implements CommandLineRunner {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    UserRepository userRepository;

    Random random = new Random();

    // Sample Vietnamese names
    String[] firstNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"};
    String[] middleNames = {"Văn", "Thị", "Đình", "Minh", "Hữu", "Quốc", "Thanh", "Anh", "Thu", "Hoàng"};
    String[] lastNames = {"Hùng", "Linh", "An", "Bình", "Dũng", "Giang", "Hải", "Khánh", "Long", "Nam", "Phong", "Quân", "Sơn", "Tú", "Vinh", "Yến"};
    String[] cities = {"Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Nha Trang", "Huế", "Vũng Tàu", "Đà Lạt", "Quy Nhơn"};

    @Override
    public void run(String... args) {
        // Check if users already exist
        long existingUserCount = userRepository.count();

        // If we have many users (>= 800), assume sample data already created
        if (existingUserCount >= 800) {
            log.info("✅ Sample users already exist ({} users found), skipping...", existingUserCount);
            return;
        }

        // If we have a few users (1-799), it's the old default data - recreate with samples
        if (existingUserCount > 0 && existingUserCount < 800) {
            log.info("🗑️  Found {} old users. Deleting to recreate with more sample data...", existingUserCount);
            userRepository.deleteAll();
            roleRepository.deleteAll();
            log.info("✅ Old users deleted. Creating new sample users...");
        }

        log.info("🚀 Initializing roles and sample users (811 total: 1 Admin, 20 Staff, 750 Customers, 40 Technicians)...");

        // ===== 1. ADMIN =====
        RoleEntity a = roleRepository.findByRoleName(RoleEnum.ADMIN);
        if (a == null) {
            RoleEntity adminRole = createRole(
                    RoleEnum.ADMIN,
                    "Quản trị viên hệ thống — có toàn quyền truy cập.",
                    List.of("MANAGE_USERS", "MANAGE_ROLES", "MANAGE_SERVICES", "VIEW_REPORTS")
            );
            a = roleRepository.save(adminRole);
        }

        UserEntity existingAdmin = userRepository.findByUsernameAndIsDeletedFalse("admin123A");
        if (existingAdmin == null) {
            UserEntity adminUser = createUser(
                    "admin123A",
                    "admin@gmail.com",
                    "1",
                    "Admin EVcare",
                    "Hà Nội, Việt Nam",
                    "0900000000",
                    a
            );
            userRepository.save(adminUser);
            log.info("✅ Created 1 ADMIN user");
        } else {
            log.info("✅ ADMIN user already exists, skipping...");
        }

        // ===== 2. STAFF =====
        RoleEntity s = roleRepository.findByRoleName(RoleEnum.STAFF);
        if (s == null) {
            RoleEntity staffRole = createRole(
                    RoleEnum.STAFF,
                    "Nhân viên kỹ thuật, chăm sóc khách hàng.",
                    List.of("VIEW_APPOINTMENTS", "UPDATE_APPOINTMENTS", "MANAGE_SERVICE_TYPES")
            );
            s = roleRepository.save(staffRole);
        }

        // Create default staff + 19 more = 20 staff total
        UserEntity existingStaff = userRepository.findByUsernameAndIsDeletedFalse("staff123A");
        if (existingStaff == null) {
            UserEntity staffUser = createUser(
                    "staff123A",
                    "staff@gmail.com",
                    "123456",
                    "Nhân viên EVcare",
                    "Đà Nẵng, Việt Nam",
                    "0901111111",
                    s
            );
            userRepository.save(staffUser);
        }

        List<UserEntity> staffUsers = new ArrayList<>();
        for (int i = 1; i <= 19; i++) {
            String username = "staff" + i;
            String email = "staff" + i + "@evcare.com";
            UserEntity existing = userRepository.findByUsernameAndIsDeletedFalse(username);
            if (existing == null) {
                String fullName = generateRandomName();
                UserEntity staff = createUser(
                        username,
                        email,
                        "Staff@123",
                        fullName,
                        generateRandomCity(),
                        generateRandomPhone(901111110 + i),
                        s
                );
                staffUsers.add(staff);
            }
        }
        if (!staffUsers.isEmpty()) {
            userRepository.saveAll(staffUsers);
            log.info("✅ Created {} new STAFF users", staffUsers.size());
        } else {
            log.info("✅ All STAFF users already exist, skipping...");
        }

        // ===== 3. CUSTOMER =====
        RoleEntity c = roleRepository.findByRoleName(RoleEnum.CUSTOMER);
        if (c == null) {
            RoleEntity customerRole = createRole(
                    RoleEnum.CUSTOMER,
                    "Khách hàng sử dụng dịch vụ của EVcare.",
                    List.of("CREATE_APPOINTMENT", "VIEW_APPOINTMENT_HISTORY", "UPDATE_PROFILE")
            );
            c = roleRepository.save(customerRole);
        }

        // Create default customer + 749 more = 750 customers total
        UserEntity existingCustomer = userRepository.findByUsernameAndIsDeletedFalse("customer123A");
        if (existingCustomer == null) {
            UserEntity customerUser = createUser(
                    "customer123A",
                    "customer@gmail.com",
                    "123456",
                    "Khách hàng EVcare",
                    "TP.HCM, Việt Nam",
                    "0902222222",
                    c
            );
            userRepository.save(customerUser);
        }

        List<UserEntity> customers = new ArrayList<>();
        for (int i = 1; i <= 749; i++) {
            String username = "customer" + i;
            String email = "customer" + i + "@evcare.com";
            UserEntity existing = userRepository.findByUsernameAndIsDeletedFalse(username);
            if (existing == null) {
                String fullName = generateRandomName();
                UserEntity customer = createUser(
                        username,
                        email,
                        "@Customer123",
                        fullName,
                        generateRandomCity(),
                        generateRandomPhone(902000000 + i * 11),  // Avoid phone number collision
                        c
                );
                customers.add(customer);
            }
        }
        if (!customers.isEmpty()) {
            userRepository.saveAll(customers);
            log.info("✅ Created {} new CUSTOMER users", customers.size());
        } else {
            log.info("✅ All CUSTOMER users already exist, skipping...");
        }

        // ===== 4. TECHNICIAN =====
        RoleEntity t = roleRepository.findByRoleName(RoleEnum.TECHNICIAN);
        if (t == null) {
            RoleEntity technicianRole = createRole(
                    RoleEnum.TECHNICIAN,
                    "Kỹ thuật viên EVcare chịu trách nhiệm sửa chữa và bảo trì xe.",
                    List.of("VIEW_APPOINTMENTS", "UPDATE_SERVICE_STATUS", "VIEW_REPORTS")
            );
            t = roleRepository.save(technicianRole);
        }

        // Create default technician + 39 more = 40 technicians total
        UserEntity existingTechnician = userRepository.findByUsernameAndIsDeletedFalse("technician123A");
        if (existingTechnician == null) {
            UserEntity technicianUser = createUser(
                    "technician123A",
                    "technician@gmail.com",
                    "123456",
                    "Kỹ thuật viên EVcare",
                    "Cần Thơ, Việt Nam",
                    "0903333333",
                    t
            );
            userRepository.save(technicianUser);
        }

        List<UserEntity> technicians = new ArrayList<>();
        for (int i = 1; i <= 39; i++) {
            String username = "technician" + i;
            String email = "technician" + i + "@evcare.com";
            UserEntity existing = userRepository.findByUsernameAndIsDeletedFalse(username);
            if (existing == null) {
                String fullName = generateRandomName();
                UserEntity technician = createUser(
                        username,
                        email,
                        "@Technician123",
                        fullName,
                        generateRandomCity(),
                        generateRandomPhone(903333330 + i),
                        t
                );
                technicians.add(technician);
            }
        }
        if (!technicians.isEmpty()) {
            userRepository.saveAll(technicians);
            log.info("✅ Created {} new TECHNICIAN users", technicians.size());
        } else {
            log.info("✅ All TECHNICIAN users already exist, skipping...");
        }

        log.info("🎉 Roles and Users initialized successfully! Total: 1 Admin, 20 Staff, 750 Customers, 40 Technicians = 811 users");
    }

    // ===== Helper Methods for Random Data =====

    private String generateRandomName() {
        String firstName = firstNames[random.nextInt(firstNames.length)];
        String middleName = middleNames[random.nextInt(middleNames.length)];
        String lastName = lastNames[random.nextInt(lastNames.length)];
        return firstName + " " + middleName + " " + lastName;
    }

    private String generateRandomCity() {
        return cities[random.nextInt(cities.length)] + ", Việt Nam";
    }

    private String generateRandomPhone(int baseNumber) {
        return "0" + baseNumber;
    }

    // ===== Original Helper Methods =====

    private RoleEntity createRole(RoleEnum roleEnum, String description, List<String> permissions) {
        return RoleEntity.builder()
                .roleName(roleEnum)
                .description(description)
                .permissions(permissions)
                .build();
    }

    private UserEntity createUser(String username, String email, String password, String fullName,
                                  String address, String phone, RoleEntity role) {
        return UserEntity.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .address(address)
                .numberPhone(phone)
                .role(role)
                .build();
    }
}
