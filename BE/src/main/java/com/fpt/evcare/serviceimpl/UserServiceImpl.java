package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.UpdationUserRequest;
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
    UserMapper  userMapper;

    @Override
    public UserResponse getUserById(UUID id) {
        UserEntity user = userRepository.findByUserId(id);
        if(user == null) throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);

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
        if(users.isEmpty()) throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_LIST_NOT_FOUND);

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
                log.error(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
            }
            throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        }
        return userEntity;
    }

    @Override
    @Transactional
    public boolean createUser(CreationUserRequest creationUserRequest) {
        checkExistCreationUserInput(creationUserRequest);
        UserEntity user = userMapper.toEntity(creationUserRequest);

        List<RoleEntity> roleIdList = new ArrayList<>();

        if(creationUserRequest.getRoleIds() != null && !creationUserRequest.getRoleIds().isEmpty()){
            for(String roleId : creationUserRequest.getRoleIds()){
                UUID formattedRoleId = UUID.fromString(roleId);
                RoleEntity roleEntity = roleRepository.findRoleByRoleId(formattedRoleId);
                if( roleEntity != null) {
                    roleIdList.add(roleEntity);
                }
            }
        }

        user.setRoles(roleIdList);
        user.setPassword(passwordEncoder.encode(creationUserRequest.getPassword()));

        String search = concatenateSearchField(
                creationUserRequest.getFullName(),
                creationUserRequest.getNumberPhone(),
                creationUserRequest.getEmail(),
                creationUserRequest.getUsername()
        );
        user.setSearch(search);

        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public boolean updateUser(UpdationUserRequest updationUserRequest, UUID id) {

        UserEntity user = userRepository.findByUserId(id);
        if(user == null) return false;

        List<RoleEntity> roleIdList = new ArrayList<>();


        if(updationUserRequest.getRoleIds() != null && !updationUserRequest.getRoleIds().isEmpty()){
            for(String roleId : updationUserRequest.getRoleIds()){
                UUID formattedRoleId = UUID.fromString(roleId);
                RoleEntity roleEntity = roleRepository.findRoleByRoleId(formattedRoleId);
                if( roleEntity != null) {
                    roleIdList.add(roleEntity);
                }
            }
        }

        user.setUserId(id);
        user.setRoles(roleIdList);
        user.setPassword(passwordEncoder.encode(updationUserRequest.getPassword()));

        if(Objects.equals(user.getEmail(), updationUserRequest.getEmail())){
            user.setEmail(updationUserRequest.getEmail());
        } else {
            if(userRepository.existsByEmail(updationUserRequest.getEmail())) throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USER_EMAIL);
            user.setEmail(updationUserRequest.getEmail());
        }


        String search = concatenateSearchField(
                updationUserRequest.getFullName(),
                updationUserRequest.getNumberPhone(),
                updationUserRequest.getEmail(),
                user.getUsername()
        );
        user.setSearch(search);

        userMapper.updateUser(updationUserRequest, user);
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean deleteUser(UUID id) {
        if(!userRepository.existsById(id)) throw new ResourceNotFoundException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
        userRepository.deleteById(id);
        return true;
    }

    //Ghép các chuỗi lại phục vụ cho việc tìm kiếm dễ hơn (thay vì phải chia các câu truy vấn khi search như WHERE user.email = ..., user.fullName = ...)
    public String concatenateSearchField(String fullName, String numberPhone, String email, String username) {
        return String.join("-",
                fullName != null ? fullName : "",
                numberPhone != null ? numberPhone : "",
                email != null ? email : "",
                username != null ? username : ""
        );
    }

    public void checkExistCreationUserInput(CreationUserRequest creationUserRequest) {
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
