package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.UpdationUserRequest;
import com.fpt.evcare.dto.response.EmployeeResponse;
import com.fpt.evcare.dto.response.PageResponse;
import com.fpt.evcare.dto.response.TechnicianResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.UserValidationException;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.UserService;
import com.fpt.evcare.utils.UtilFunction;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    UserMapper  userMapper;

    @Override
    public UserResponse getUserById(UUID id) {
        UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(id);
        if(user == null) {
            log.warn(UserConstants.LOG_ERR_USER_NOT_FOUND,  id);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        List<String> roleNames = new ArrayList<>();
        if (user.getRole() != null) {
            roleNames.add(user.getRole().getRoleName().toString());
        }

        UserResponse response = userMapper.toResponse(user);
        response.setRoleName(roleNames);
        response.setIsAdmin(isAdminRole(roleNames));

        log.info(UserConstants.LOG_SUCCESS_SHOWING_USER);
        return response;
    }

    @Override
    public PageResponse<UserResponse> searchUser(Pageable pageable, String keyword) {
        Page<UserEntity> usersPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            usersPage = userRepository.findByIsDeletedFalse(pageable);
        } else {
            usersPage = userRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword.trim(), pageable);
        }

        if (usersPage.isEmpty()) {
            log.error(UserConstants.LOG_ERR_USER_LIST_NOT_FOUND);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_LIST_NOT_FOUND);
        }

        List<UserResponse> userResponses = usersPage.map(user -> {
            UserResponse response = userMapper.toResponse(user);
            List<String> roleNames = new ArrayList<>();
            if (user.getRole() != null) {
                roleNames.add(user.getRole().getRoleName().toString());
            }
            response.setRoleName(roleNames);
            response.setIsAdmin(isAdminRole(roleNames));
            return response;
        }).getContent();

        log.info(UserConstants.LOG_SUCCESS_SHOWING_USER_LIST);
        return PageResponse.<UserResponse>builder()
                .data(userResponses)
                .page(usersPage.getNumber())
                .size(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .build();
    }

    @Override
    public PageResponse<EmployeeResponse> findAllEmployee(Pageable pageable, String keyword) {
        return null;

    }

    @Override
    public UserEntity getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmailAndIsDeletedFalse(email);
        if (userEntity == null) {
            if (log.isErrorEnabled()) {
                log.error(UserConstants.MESSAGE_ERR_USER_NOT_FOUND, email);
            }
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        log.info(UserConstants.LOG_SUCCESS_SHOWING_USER, email);
        return userEntity;
    }

    @Override
    public UserEntity getUserByUsername(String username) {
        UserEntity userEntity = userRepository.findByUsernameAndIsDeletedFalse(username);
        if (userEntity == null) {
            if (log.isErrorEnabled()) {
                log.error(UserConstants.MESSAGE_ERR_USER_NOT_FOUND, username);
            }
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        log.info(UserConstants.LOG_SUCCESS_SHOWING_USER, username);
        return userEntity;
    }

    @Override
    public UserEntity getUserByPhoneNumber(String phoneNumber) {
        UserEntity userEntity = userRepository.findByNumberPhoneAndIsDeletedFalse(phoneNumber);
        if (userEntity == null) {
            if (log.isErrorEnabled()) {
                log.error(UserConstants.MESSAGE_ERR_USER_NOT_FOUND, phoneNumber);
            }
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        log.info(UserConstants.LOG_SUCCESS_SHOWING_USER, phoneNumber);
        return userEntity;
    }

    @Override
    public UserResponse getUserByUserInformation(String userInformation) {

        UserEntity user = userRepository.findByUsernameOrEmailOrNumberPhoneAndIsDeletedFalse(userInformation, userInformation, userInformation);

        if (user == null) {
            if (log.isErrorEnabled()) {
                log.error(UserConstants.MESSAGE_ERR_USER_NOT_FOUND, userInformation);
            }
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public boolean createUser(CreationUserRequest creationUserRequest) {
        checkExistCreationUserInput(creationUserRequest);
        UserEntity user = userMapper.toEntity(creationUserRequest);

        // Set single role (take first role from list if provided, otherwise default to CUSTOMER)
        if(creationUserRequest.getRoleIds() != null && !creationUserRequest.getRoleIds().isEmpty()){
            UUID roleId = creationUserRequest.getRoleIds().get(0); // Take first role
            RoleEntity roleEntity = roleRepository.findRoleByRoleId(roleId);
            if(roleEntity != null) {
                user.setRole(roleEntity);
            }
        } else {
            // Default to CUSTOMER role if no role specified
            RoleEntity customerRole = roleRepository.findByRoleName(RoleEnum.CUSTOMER);
            if(customerRole != null) {
                user.setRole(customerRole);
            }
        }
        user.setPassword(passwordEncoder.encode(creationUserRequest.getPassword()));

        String search = UtilFunction.concatenateSearchField(creationUserRequest.getFullName(),
                creationUserRequest.getNumberPhone(),
                creationUserRequest.getEmail(),
                user.getUsername()
        );
        user.setSearch(search);

        log.info(UserConstants.LOG_SUCCESS_CREATING_USER, creationUserRequest.getUsername());
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public boolean updateUser(UpdationUserRequest updationUserRequest, UUID id) {

        UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(id);
        if(user == null) {
            log.warn(UserConstants.LOG_ERR_USER_NOT_FOUND, id);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }

        // Set single role (take first role from list if provided)
        if(updationUserRequest.getRoleIds() != null && !updationUserRequest.getRoleIds().isEmpty()){
            UUID roleId = updationUserRequest.getRoleIds().get(0); // Take first role
            RoleEntity roleEntity = roleRepository.findRoleByRoleId(roleId);
            if(roleEntity != null) {
                user.setRole(roleEntity);
            }
        }
        
        // Only update password if provided (not null and not empty)
        if(updationUserRequest.getPassword() != null && !updationUserRequest.getPassword().trim().isEmpty()){
            user.setPassword(passwordEncoder.encode(updationUserRequest.getPassword()));
        }

        // Validate email duplication
        if(Objects.equals(user.getEmail(), updationUserRequest.getEmail())){
            user.setEmail(updationUserRequest.getEmail());
        } else {
            if(userRepository.existsByEmail(updationUserRequest.getEmail())){
                log.error(UserConstants.LOG_ERR_DUPLICATED_USER_EMAIL, "Email: " + updationUserRequest.getEmail());
                throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USER_EMAIL);
            }
            user.setEmail(updationUserRequest.getEmail());
        }

        // Validate phone number duplication
        if(updationUserRequest.getNumberPhone() != null && !updationUserRequest.getNumberPhone().isEmpty()){
            if(!Objects.equals(user.getNumberPhone(), updationUserRequest.getNumberPhone())){
                if(userRepository.existsByNumberPhone(updationUserRequest.getNumberPhone())){
                    log.error(UserConstants.LOG_ERR_DUPLICATED_USER_PHONE, "Phone: " + updationUserRequest.getNumberPhone());
                    throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USER_PHONE);
                }
            }
        }

        String search = UtilFunction.concatenateSearchField(updationUserRequest.getFullName(),
                updationUserRequest.getNumberPhone(),
                updationUserRequest.getEmail(),
                user.getUsername()
        );
        user.setSearch(search);

        userMapper.updateUser(updationUserRequest, user);

        log.info(UserConstants.LOG_SUCCESS_UPDATING_USER, user.getUsername());
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteUser(UUID id) {
        UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(id);

        if(user == null) {
            log.warn(UserConstants.LOG_ERR_USER_NOT_FOUND, "User id: " + id);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        user.setIsDeleted(true);

        log.info(UserConstants.LOG_SUCCESS_DELETING_USER, "Username: " + user.getUsername());
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public boolean restoreUser(UUID id) {
        UserEntity user = userRepository.findByUserIdAndIsDeletedTrue(id);

        if(user == null) {
            log.warn(UserConstants.LOG_ERR_USER_NOT_FOUND, id);
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        user.setIsDeleted(false);

        log.info(UserConstants.LOG_SUCCESS_RESTORING_USER, user.getUsername());
        userRepository.save(user);
        return true;
    }

    @Override
    public List<TechnicianResponse> getTechnicians() {
        log.info("Getting technicians list");
        List<UserEntity> technicians = userRepository.findTechnicians();

        return technicians.stream()
                .map(technician -> TechnicianResponse.builder()
                        .userId(technician.getUserId())
                        .fullName(technician.getFullName())
                        .build())
                .toList();
    }

    @Override
    public List<UserResponse> getUsersByRole(String roleName) {
        try {
            com.fpt.evcare.enums.RoleEnum roleEnum = com.fpt.evcare.enums.RoleEnum.valueOf(roleName.toUpperCase());
            List<UserEntity> users = userRepository.findByRoleNameAndIsDeletedFalse(roleEnum);

            if (users.isEmpty()) {
                log.warn("No users found for role: {}", roleName);
                return new ArrayList<>();
            }

            List<UserResponse> userResponses = new ArrayList<>();
            for (UserEntity user : users) {
                UserResponse response = userMapper.toResponse(user);
                List<String> roleNames = new ArrayList<>();
                if (user.getRole() != null) {
                    roleNames.add(user.getRole().getRoleName().toString());
                }
                response.setRoleName(roleNames);
                userResponses.add(response);
            }

            log.info("Found {} users for role: {}", userResponses.size(), roleName);
            return userResponses;
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", roleName);
            throw new ResourceNotFoundException("Vai trò không hợp lệ: " + roleName);
        }
    }

    private void checkExistCreationUserInput(CreationUserRequest creationUserRequest) {
        List<String> errors = new ArrayList<>(); // Trả về 1 danh sách lỗi (để biết rõ đang bị lỗi những gì)
            if(creationUserRequest.getUsername() != null && userRepository.existsByUsername(creationUserRequest.getUsername())){
                    errors.add(UserConstants.MESSAGE_ERR_DUPLICATED_USERNAME);
            }
            if(creationUserRequest.getEmail() != null && userRepository.existsByEmail(creationUserRequest.getEmail())){
                    errors.add(UserConstants.MESSAGE_ERR_DUPLICATED_USER_EMAIL);
            }
            if(creationUserRequest.getNumberPhone() != null && !creationUserRequest.getNumberPhone().isEmpty() 
                    && userRepository.existsByNumberPhone(creationUserRequest.getNumberPhone())){
                    errors.add(UserConstants.MESSAGE_ERR_DUPLICATED_USER_PHONE);
            }
            if(!errors.isEmpty()) throw new UserValidationException(String.join(", ", errors));
    }

    private boolean isAdminRole(List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return false;
        }
        return roleNames.stream().anyMatch(role -> !role.equals("CUSTOMER"));
    }
}
