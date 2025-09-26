package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.UserRequest;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.exception.UserValidationException;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.UserService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
    UserConstants userConstants;
    UserMapper  userMapper;

    @Override
    public UserResponse getUserById(UUID id) {
        UserEntity user = userRepository.findByUserId(id);
        if(user == null) return null;

        List<String> roleNames = new ArrayList<>();
        for(RoleEntity role : user.getRoles()){
            roleNames.add(role.getRoleName().toString());
        }

        UserResponse response = userMapper.toResponse(user);
        response.setRoleName(roleNames);

        return response;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        if(users.isEmpty()) return new ArrayList<>();;

        List<UserResponse> userResponses = userMapper.toResponses(users);

        for(int i = 0; i<users.size(); i++){
            UserEntity user = users.get(i);
            UserResponse response = userResponses.get(i);
            List<String> roleName = new ArrayList<>();

            if(user.getRoles() != null){
                for(RoleEntity role : user.getRoles()){
                    roleName.add(role.getRoleName().toString());
                }
                response.setRoleName(roleName);
            }
        }

        return userResponses;
    }

    @Override
    public UserEntity getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);
        if (userEntity == null) {
            if (log.isErrorEnabled()) {
                log.error(UserConstants.USER_NOT_FOUND);
            }
            throw new ResourceNotFoundException(UserConstants.USER_NOT_FOUND);
        }
        return userEntity;
    }

    @Override
    @Transactional
    public boolean createUser(UserRequest userRequest) {
        checkExistUserInput(userRequest);
        UserEntity user = userMapper.toEntity(userRequest);

        List<RoleEntity> roleIdList = new ArrayList<>();

        if(userRequest.getRoleIds() != null && !userRequest.getRoleIds().isEmpty()){
            for(String roleId : userRequest.getRoleIds()){
                UUID formattedRoleId = UUID.fromString(roleId);
                RoleEntity roleEntity = roleRepository.findRoleByRoleId(formattedRoleId);
                if( roleEntity != null) {
                    roleIdList.add(roleEntity);
                }
            }
        }

        user.setRoles(roleIdList);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public boolean updateUser(UserRequest userRequest, UUID id) {

        UserEntity user = userRepository.findByUserId(id);
        if(user == null) return false;

        List<RoleEntity> roleIdList = new ArrayList<>();


        if(userRequest.getRoleIds() != null && !userRequest.getRoleIds().isEmpty()){
            for(String roleId : userRequest.getRoleIds()){
                UUID formattedRoleId = UUID.fromString(roleId);
                RoleEntity roleEntity = roleRepository.findRoleByRoleId(formattedRoleId);
                if( roleEntity != null) {
                    roleIdList.add(roleEntity);
                }
            }
        }

        user.setUserId(id);
        user.setRoles(roleIdList);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));

        if(Objects.equals(user.getEmail(), userRequest.getEmail())){
            user.setEmail(userRequest.getEmail());
        } else {
            if(userRepository.existsByEmail(userRequest.getEmail())) throw new UserValidationException(userConstants.DUPLICATED_USER_EMAIL);
            user.setEmail(userRequest.getEmail());
        }

        userMapper.updateUser(userRequest, user);
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean deleteUser(UUID id) {
        if(!userRepository.existsById(id)) throw new ResourceNotFoundException(UserConstants.USER_NOT_FOUND);
        userRepository.deleteById(id);
        return true;
    }

    public void checkExistUserInput(UserRequest userRequest) {
        List<String> errors = new ArrayList<>(); // Trả về 1 danh sách lỗi (để biết rõ đang bị lỗi những gì)
            if(userRequest.getUsername() != null){
                if(userRepository.existsByUsername(userRequest.getUsername()) ) {
                    errors.add(userConstants.DUPLICATED_USERNAME);
                }
            }
            if(userRequest.getEmail() != null){
                if(userRepository.existsByEmail(userRequest.getEmail())){
                    System.out.println("vo check mail");
                    errors.add(userConstants.DUPLICATED_USER_EMAIL);
                }
            }
            if(!errors.isEmpty()){
            throw new UserValidationException(String.join(", ", errors));
            }
    }

}
