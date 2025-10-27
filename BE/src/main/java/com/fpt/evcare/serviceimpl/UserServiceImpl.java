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
        for(RoleEntity role : user.getRoles()){
                roleNames.add(role.getRoleName().toString());
        }

        UserResponse response = userMapper.toResponse(user);
        response.setRoleName(roleNames);

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
            if (user.getRoles() != null) {
                for (RoleEntity role : user.getRoles()) {
                    roleNames.add(role.getRoleName().toString());
                }
            }
            response.setRoleName(roleNames);
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
//        Page<UserEntity> usersPage;
//        if (keyword == null || keyword.trim().isEmpty()) {
//            usersPage = userRepository.findByIsDeletedFalse(pageable);
//        } else {
//            usersPage = userRepository.findBySearchContainingIgnoreCaseAndIsDeletedFalse(keyword.trim(), pageable);
//        }
//
//        if (usersPage.isEmpty()) {
//            log.error(UserConstants.LOG_ERR_USER_LIST_NOT_FOUND);
//            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_LIST_NOT_FOUND);
//        }
//
//        List<EmployeeResponse> userResponses = usersPage.map(user -> {
//            EmployeeResponse response = userMapper.toResponse(user);
//            List<String> roleNames = new ArrayList<>();
//            if (user.getRoles() != null) {
//                for (RoleEntity role : user.getRoles()) {
//                    roleNames.add(role.getRoleName().toString());
//                }
//            }
//            response.setRoleName(roleNames);
//            return response;
//        }).getContent();
//
//        log.info(UserConstants.LOG_SUCCESS_SHOWING_USER_LIST);
//        return PageResponse.<EmployeeResponse>builder()
//                .data(userResponses)
//                .page(usersPage.getNumber())
//                .size(usersPage.getSize())
//                .totalElements(usersPage.getTotalElements())
//                .totalPages(usersPage.getTotalPages())
//                .build();
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

        List<RoleEntity> roleIdList = new ArrayList<>();

        if(creationUserRequest.getRoleIds() != null && !creationUserRequest.getRoleIds().isEmpty()){
            for(UUID roleId : creationUserRequest.getRoleIds()){
                RoleEntity roleEntity = roleRepository.findRoleByRoleId(roleId);
                if( roleEntity != null) {
                    roleIdList.add(roleEntity);
                }
            }
        }

        user.setRoles(roleIdList);
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

        List<RoleEntity> roleIdList = new ArrayList<>();

        if(updationUserRequest.getRoleIds() != null && !updationUserRequest.getRoleIds().isEmpty()){
            for(UUID roleId : updationUserRequest.getRoleIds()){
                RoleEntity roleEntity = roleRepository.findRoleByRoleId(roleId);
                if( roleEntity != null) {
                    roleIdList.add(roleEntity);
                }
            }
        }

        user.setRoles(roleIdList);
        user.setPassword(passwordEncoder.encode(updationUserRequest.getPassword()));

        if(Objects.equals(user.getEmail(), updationUserRequest.getEmail())){
            user.setEmail(updationUserRequest.getEmail());
        } else {
            if(userRepository.existsByEmail(updationUserRequest.getEmail())){
                log.error(UserConstants.LOG_ERR_DUPLICATED_USER_EMAIL, "Email: " + updationUserRequest.getEmail());
                throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USER_EMAIL);
            }
            user.setEmail(updationUserRequest.getEmail());
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
                .collect(java.util.stream.Collectors.toList());
    }

    private void checkExistCreationUserInput(CreationUserRequest creationUserRequest) {
        List<String> errors = new ArrayList<>(); // Trả về 1 danh sách lỗi (để biết rõ đang bị lỗi những gì)
            if(creationUserRequest.getUsername() != null && userRepository.existsByUsername(creationUserRequest.getUsername())){
                    errors.add(UserConstants.MESSAGE_ERR_DUPLICATED_USERNAME);
            }
            if(creationUserRequest.getEmail() != null && userRepository.existsByEmail(creationUserRequest.getEmail())){
                    errors.add(UserConstants.MESSAGE_ERR_DUPLICATED_USER_EMAIL);
            }
            if(!errors.isEmpty()) throw new UserValidationException(String.join(", ", errors));
    }
}
