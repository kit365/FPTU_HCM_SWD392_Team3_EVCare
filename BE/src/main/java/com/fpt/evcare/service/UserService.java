package com.fpt.evcare.service;

import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.UpdationUserRequest;
import com.fpt.evcare.dto.response.EmployeeResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.UserEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public interface UserService {
    UserResponse getUserById(UUID id);
    PageResponse<UserResponse> searchUser(Pageable pageable, String keyword);

    PageResponse<EmployeeResponse> findAllEmployee(Pageable pageable, String keyword);

    UserEntity getUserByEmail(String email);
    UserEntity getUserByUsername(String username);
    UserEntity getUserByPhoneNumber(String phoneNumber);
    UserResponse getUserByUserInformation(String userInformation);

    boolean createUser(CreationUserRequest creationUserRequest);
    boolean updateUser(UpdationUserRequest updationUserRequest, UUID id);
    boolean deleteUser(UUID id);
    boolean restoreUser(UUID id);


}
