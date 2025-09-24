package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.nimbusds.jose.JOSEException;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest) throws JOSEException;
}
