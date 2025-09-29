package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.request.user.UpdationUserRequest;
import com.fpt.evcare.dto.response.RegisterUserResponse;
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
    boolean createUser(CreationUserRequest creationUserRequest);
    boolean updateUser(UpdationUserRequest updationUserRequest, UUID id);
    boolean deleteUser(UUID id);

}
