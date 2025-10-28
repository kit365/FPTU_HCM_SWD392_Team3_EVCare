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

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Order(2)
public class RoleAndUserData implements CommandLineRunner {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (roleRepository.count() > 0 && userRepository.count() > 0) {
            log.info("✅ Roles and Users already initialized, skipping...");
            return;
        }

        log.info("🚀 Initializing roles and default users...");

        // ===== 1. ADMIN =====
        RoleEntity adminRole = createRole(
                RoleEnum.ADMIN,
                "Quản trị viên hệ thống — có toàn quyền truy cập.",
                List.of("MANAGE_USERS", "MANAGE_ROLES", "MANAGE_SERVICES", "VIEW_REPORTS")
        );

        RoleEntity a = roleRepository.save(adminRole);

        UserEntity adminUser = createUser(
                "admin123A",
                "admin@gmail.com",
                "123456",
                "Admin EVcare",
                "Hà Nội, Việt Nam",
                "0900000000",
                a
        );
        userRepository.save(adminUser);

        // ===== 2. STAFF =====
        RoleEntity staffRole = createRole(
                RoleEnum.STAFF,
                "Nhân viên kỹ thuật, chăm sóc khách hàng.",
                List.of("VIEW_APPOINTMENTS", "UPDATE_APPOINTMENTS", "MANAGE_SERVICE_TYPES")
        );
        RoleEntity s = roleRepository.save(staffRole);

        UserEntity staffUser = createUser(
                "staff123A",
                "staff@evcare.com",
                "Staff@123",
                "Nhân viên EVcare",
                "Đà Nẵng, Việt Nam",
                "0901111111",
                s
        );
        userRepository.save(staffUser);

        // ===== 3. CUSTOMER =====
        RoleEntity customerRole = createRole(
                RoleEnum.CUSTOMER,
                "Khách hàng sử dụng dịch vụ của EVcare.",
                List.of("CREATE_APPOINTMENT", "VIEW_APPOINTMENT_HISTORY", "UPDATE_PROFILE")
        );
        RoleEntity c = roleRepository.save(customerRole);

        UserEntity customerUser = createUser(
                "customer123A",
                "customer@evcare.com",
                "@Customer123",
                "Khách hàng EVcare",
                "TP.HCM, Việt Nam",
                "0902222222",
                c
        );
        userRepository.save(customerUser);

        // ===== 4. TECHNICIAN =====
        RoleEntity technicianRole = createRole(
                RoleEnum.TECHNICIAN,
                "Kỹ thuật viên EVcare chịu trách nhiệm sửa chữa và bảo trì xe.",
                List.of("VIEW_APPOINTMENTS", "UPDATE_SERVICE_STATUS", "VIEW_REPORTS")
        );
        RoleEntity t = roleRepository.save(technicianRole);

        UserEntity technicianUser = createUser(
                "technician123A",
                "technician@evcare.com",
                "@Technician123",
                "Kỹ thuật viên EVcare",
                "Cần Thơ, Việt Nam",
                "0903333333",
                t
        );
        userRepository.save(technicianUser);

        log.info("✅ Roles and Users initialized successfully!");
    }

    // ===== Helper Methods =====

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
                .roles(List.of(role))
                .build();
    }


}