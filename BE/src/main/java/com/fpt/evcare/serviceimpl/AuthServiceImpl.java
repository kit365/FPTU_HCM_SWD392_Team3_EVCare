package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.entity.AccountEntity;
import com.fpt.evcare.repository.AccountRepository;
import com.fpt.evcare.service.AuthService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {
    AccountRepository accountRepository;
    PasswordEncoder passwordEncoder;


    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        AccountEntity account = accountRepository.findByEmail(loginRequest.getEmail());
        boolean authenticated = passwordEncoder.matches(loginRequest.getPassword(), account.getPassword());
        if (authenticated) {
            LoginResponse response = new LoginResponse();
            response.setToken("demo-token");
            response.setAuthenticated(true);
            return response;
        }
        return null;
    }
}
