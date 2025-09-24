package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.UserRequest;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.UserEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface UserService {
    UserResponse getUserById(UUID id);
    List<UserResponse> getAllUsers();
    UserEntity getUserByEmail(String email);
    boolean createUser(UserRequest userRequest);
    boolean updateUser(UserRequest userRequest, UUID id);
    boolean deleteUser(UUID id);
}
