package com.fpt.evcare.initializer;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountData implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        createRole();
        createUser();

    }

    private void createRole() {
        RoleEntity role = new RoleEntity();
        role.setRoleName(RoleEnum.CUSTOMER);
        roleRepository.save(role);

        RoleEntity role1 = new RoleEntity();
        role1.setRoleName(RoleEnum.ADMIN);
        roleRepository.save(role1);

        RoleEntity role2 = new RoleEntity();
        role2.setRoleName(RoleEnum.STAFF);
        roleRepository.save(role2);

        RoleEntity role3 = new RoleEntity();
        role3.setRoleName(RoleEnum.TECHNICIAN);
    }

    private void createUser() {
        UserEntity[] account = {
                UserEntity.builder()
                        .username("admin")
                        .email("admin@gmail.com")
                        .password(passwordEncoder.encode("123456"))
                        .build(),

                UserEntity.builder()
                        .username("tester")
                        .email("test@gmail.com")
                        .password(passwordEncoder.encode("123456"))
                        .build()
        };
        for (UserEntity user : account) {
            if (userRepository.findByEmailAndIsDeletedFalse(user.getEmail()) == null) {
                userRepository.save(user);
            }
        }
    }
}
