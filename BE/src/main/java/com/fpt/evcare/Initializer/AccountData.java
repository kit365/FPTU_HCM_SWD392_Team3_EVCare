package com.fpt.evcare.Initializer;
import com.fpt.evcare.entity.AccountEntity;
import com.fpt.evcare.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AccountData implements CommandLineRunner {
    private final AccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAccount();
    }

    private void createAccount() {
        AccountEntity[] account = {
                AccountEntity.builder()
                        .email("admin@gmail.com")
                        .password(passwordEncoder.encode("123456"))
                        .build(),

                AccountEntity.builder()
                        .email("test@gmail.com")
                        .password(passwordEncoder.encode("123456"))
                        .build()
        };
        for (AccountEntity acc : account) {
            if (userRepository.findByEmail(acc.getEmail()) == null) {
                userRepository.save(acc);
            }
        }
    }
}
