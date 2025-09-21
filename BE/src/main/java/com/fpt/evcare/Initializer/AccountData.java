package com.fpt.evcare.Initializer;
import com.fpt.evcare.entity.UserEntity;
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

    @Override
    public void run(String... args) throws Exception {
        createUser();
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
            if (userRepository.findByEmail(user.getEmail()) == null) {
                userRepository.save(user);
            }
        }
    }
}
