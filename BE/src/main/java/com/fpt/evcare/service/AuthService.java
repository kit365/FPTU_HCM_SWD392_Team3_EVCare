package com.fpt.evcare.service;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {
    LoginResponse login(LoginRequest loginRequest);
}
