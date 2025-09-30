package com.fpt.evcare.controller;

import com.fpt.evcare.base.ApiResponse;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.UpdationUserRequest;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.service.UserService;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping(UserConstants.BASE_URL)
public class UserController {
    UserService userService;

    @GetMapping(UserConstants.USER)
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse userResponse = userService.getUserById(id);

        return ResponseEntity
                .ok(ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message(UserConstants.MESSAGE_SUCCESS_SHOWING_USER)
                        .data(userResponse)
                        .build()
                );
    }

    @GetMapping(UserConstants.USER_LIST)
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize,
           @Nullable @RequestParam(name = "keyword") String keyword) {
        Pageable pageable = PageRequest.of(page, pageSize);
        PageResponse<UserResponse> userResponses = userService.searchUser(pageable, keyword);
        return ResponseEntity
                .ok(ApiResponse.<PageResponse<UserResponse>>builder()
                        .success(true)
                        .message(UserConstants.MESSAGE_SUCCESS_SHOWING_USER)
                        .data(userResponses)
                        .build()
                );
    }

    @PostMapping(UserConstants.USER_CREATION)
    public ResponseEntity<ApiResponse<String>> createUser(@Valid @RequestBody CreationUserRequest creationUserRequest) {
       boolean result = userService.createUser(creationUserRequest);

        return ResponseEntity
               .ok(ApiResponse.<String>builder()
                       .success(result)
                       .message(UserConstants.MESSAGE_SUCCESS_CREATING_USER )
                       .build()
               );
    }

    @PatchMapping(UserConstants.USER_UPDATE)
    public ResponseEntity<ApiResponse<String>> updateUser(@PathVariable UUID id,@Valid @RequestBody UpdationUserRequest updationUserRequest) {
        boolean result = userService.updateUser(updationUserRequest, id);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(UserConstants.MESSAGE_SUCCESS_UPDATING_USER)
                        .build()
                );
    }

    @DeleteMapping(UserConstants.USER_DELETE)
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID id) {
        boolean result = userService.deleteUser(id);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(UserConstants.MESSAGE_SUCCESS_DELETING_USER)
                        .build()
                );
    }

    @PatchMapping(UserConstants.USER_RESTORE)
    public ResponseEntity<ApiResponse<String>> restoreUser(@PathVariable UUID id) {
        boolean result = userService.restoreUser(id);

        return ResponseEntity
                .ok(ApiResponse.<String>builder()
                        .success(result)
                        .message(UserConstants.MESSAGE_SUCCESS_UPDATING_USER)
                        .build()
                );
    }
}
