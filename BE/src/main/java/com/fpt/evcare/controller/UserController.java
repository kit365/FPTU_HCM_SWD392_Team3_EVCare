package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.UserConstaints;
import com.fpt.evcare.dto.request.UserRequest;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.UserValidationException;
import com.fpt.evcare.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(UserConstaints.BASE_URL)
public class UserController {
    UserService userService;

    @GetMapping(UserConstaints.USER)
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse userResponse = userService.getUserById(id);
        if (userResponse == null) throw new ResourceNotFoundException(UserConstaints.USER_NOT_FOUND);

        return ResponseEntity
                .ok(ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message(UserConstaints.SUCCESS_SHOWING_USER)
                        .data(userResponse)
                        .build()
                );
    }

    @GetMapping(UserConstaints.USER_LIST)
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> userResponse = userService.getAllUsers();
        if (userResponse.isEmpty()) throw new ResourceNotFoundException(UserConstaints.USER_LIST_NOT_FOUND);

        return ResponseEntity
                .ok(ApiResponse.<List<UserResponse>>builder()
                        .success(true)
                        .message(UserConstaints.SUCCESS_SHOWING_USER)
                        .data(userResponse)
                        .build()
                );
    }

    @PostMapping(UserConstaints.USER_CREATION)
    public ResponseEntity<ApiResponse<String>> createUser(@Valid @RequestBody UserRequest userRequest) {
       boolean result = userService.createUser(userRequest);

        return ResponseEntity
               .ok(ApiResponse.<String>builder()
                       .success(result)
                       .message(UserConstaints.SUCCESS_CREATING_USER )
                       .build()
               );
    }

    @PatchMapping(UserConstaints.USER_UPDATE)
    public ResponseEntity<ApiResponse<String>> updateUser(@PathVariable UUID id,@Valid @RequestBody UserRequest userRequest) {
        boolean result = userService.updateUser(userRequest, id);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(UserConstaints.SUCCESS_UPDATING_USER)
                        .build()
                );
    }

    @DeleteMapping(UserConstaints.USER_DELETE)
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID id) {
        boolean result = userService.deleteUser(id);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(UserConstaints.SUCCESS_DELETING_USER)
                        .build()
                );    }
}
