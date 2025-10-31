package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.constants.TokenConstants;
import com.fpt.evcare.constants.UserConstants;
import com.fpt.evcare.dto.request.LoginRequest;
import com.fpt.evcare.dto.request.LogoutRequest;
import com.fpt.evcare.dto.request.TokenRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.response.LoginResponse;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.exception.DisabledException;
import com.fpt.evcare.exception.InvalidCredentialsException;
import com.fpt.evcare.exception.UserValidationException;
import com.fpt.evcare.mapper.UserMapper;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.AuthService;
import com.fpt.evcare.service.TokenService;
import com.fpt.evcare.service.UserService;
import com.nimbusds.jose.JOSEException;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    PasswordEncoder passwordEncoder;
    UserService userService;
    TokenService tokenService;
    UserRepository userRepository;
    UserMapper userMapper;
    RoleRepository roleRepository;

    @Override
    public LoginResponse login(LoginRequest loginRequest) throws JOSEException {
        UserEntity user = userService.getUserByEmail(loginRequest.getEmail());
        validateAccount(user);

        boolean authenticated = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());

        if (!authenticated) {
            if (log.isErrorEnabled()) {
                log.error(AuthConstants.MESSAGE_ERR_INVALID_PASSWORD);
            }
            throw new InvalidCredentialsException(AuthConstants.MESSAGE_ERR_INVALID_PASSWORD);
        }

        // Sử dụng TokenService để generate tokens
        String accessToken = tokenService.generateAccessToken(user.getUserId());
        String refreshToken = tokenService.generateRefreshToken(user.getUserId());

        // Lưu vào Redis
        tokenService.saveAccessToken(user.getUserId(), accessToken, 3600); // 1h
        tokenService.saveRefreshToken(user.getUserId(), refreshToken, 604800);   // 7 ngày

        // Check if user has admin-level role (not CUSTOMER)
        boolean isAdmin = user.getRole() != null && !user.getRole().getRoleName().toString().equals("CUSTOMER");

        // Debug: Log user role and isAdmin status
        if (log.isInfoEnabled()) {
            String role = user.getRole() != null 
                ? user.getRole().getRoleName().toString()
                : "NULL_ROLE";
            log.info("Login - User: {}, Role: {}, isAdmin: {}", loginRequest.getEmail(), role, isAdmin);
            log.info(AuthConstants.MESSAGE_SUCCESS_ACCOUNT_LOGIN, loginRequest.getEmail());
        }

        // Trả response
        return LoginResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .authenticated(true)
                .isAdmin(isAdmin)
                .build();
    }


    private void validateAccount(UserEntity user) {
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            log.error(UserConstants.MESSAGE_ERR_USER_DELETED);
            throw new DisabledException(UserConstants.MESSAGE_ERR_USER_DELETED);
        }
        // sau này thêm: locked, expired... cũng nhét ở đây
    }

    @Override
    @Transactional
    public String logout(LogoutRequest request) {
        tokenService.removeTokens(request.getUserId());
        
        // Set offline status khi logout cho tất cả users (STAFF/ADMIN/CUSTOMER)
        try {
            UserEntity user = userRepository.findByUserIdAndIsDeletedFalse(request.getUserId());
            if (user != null) {
                user.setIsActive(false);
                user.setUpdatedBy("SYSTEM");
                userRepository.save(user);
                
                if (user.getRole().getRoleName() == RoleEnum.STAFF || user.getRole().getRoleName() == RoleEnum.ADMIN) {
                    log.info("⚠️ Staff {} logged out, set to OFFLINE", request.getUserId());
                } else if (user.getRole().getRoleName() == RoleEnum.CUSTOMER) {
                    log.info("⚠️ Customer {} logged out, set to OFFLINE", request.getUserId());
                }
            }
        } catch (Exception e) {
            log.error("❌ Error updating offline status during logout: {}", e.getMessage());
            // Không throw exception vì logout đã thành công
        }
        
        if (log.isInfoEnabled()) {
            log.info("User with ID {} logged out successfully", request.getUserId());
        }
        return "Đăng xuất thành công";
    }

    @Override
    public UserResponse getUserByToken(TokenRequest token) {
        try {
            UUID userId = tokenService.extractUserIdFromToken(token.getToken());
            UserEntity userEntity = userRepository.findByUserIdAndIsDeletedFalse(userId);
            if (userEntity == null) {
                throw new IllegalArgumentException(UserConstants.MESSAGE_ERR_USER_NOT_FOUND);
            }

            List<String> roleNames = new ArrayList<>();
            if (userEntity.getRole() != null) {
                roleNames.add(userEntity.getRole().getRoleName().toString());
            }

            UserResponse response = userMapper.toResponse(userEntity);
            response.setRoleName(roleNames);
            response.setIsAdmin(isAdminRole(roleNames));

            return response;
        } catch (Exception e) {
            if (log.isErrorEnabled()) {
                log.error("Failed to get user from token: {}", e.getMessage());
            }
            throw new IllegalArgumentException(TokenConstants.MESSAGE_ERR_TOKEN_DISABLED);
        }
    }

    private boolean isAdminRole(List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return false;
        }
        return roleNames.stream().anyMatch(role -> !role.equals("CUSTOMER"));
    }



    @Override
    public RegisterUserResponse registerUser(@Valid RegisterUserRequest registerUserRequest) throws JOSEException {
        // Validate user không tồn tại
        UserEntity existingUser = userRepository.findByEmailAndIsDeletedFalse(registerUserRequest.getEmail());
        if (existingUser != null) {
            if(log.isWarnEnabled()) {
                log.warn(UserConstants.LOG_ERR_DUPLICATED_USER_EMAIL);
            }
            throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USER_EMAIL);
        }

        if(userRepository.existsByUsername(registerUserRequest.getUsername())) {
            if(log.isWarnEnabled()) {
                log.warn(UserConstants.LOG_ERR_DUPLICATED_USERNAME);
            }
            throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USERNAME);
        }

        if(userRepository.existsByNumberPhone(registerUserRequest.getNumberPhone())) {
            if(log.isWarnEnabled()) {
                log.warn(UserConstants.LOG_ERR_DUPLICATED_USER_PHONE);
            }
            throw new UserValidationException(UserConstants.MESSAGE_ERR_DUPLICATED_USER_PHONE);
        }

        // Tạo user mới
        UserEntity userEntity = userMapper.toEntity(registerUserRequest);
        userEntity.setPassword(passwordEncoder.encode(registerUserRequest.getPassword()));
        userEntity.setRole(roleRepository.findByRoleName(RoleEnum.CUSTOMER));
        userRepository.save(userEntity);
        
        // Sử dụng TokenService để generate tokens
        String accessToken = tokenService.generateAccessToken(userEntity.getUserId());
        String refreshToken = tokenService.generateRefreshToken(userEntity.getUserId());
        
        // Lưu tokens vào Redis
        tokenService.saveAccessToken(userEntity.getUserId(), accessToken, 3600); // 1h
        tokenService.saveRefreshToken(userEntity.getUserId(), refreshToken, 604800);   // 7 ngày
        
        if(log.isInfoEnabled()) {
            log.info(AuthConstants.LOG_SUCCESS_ACCOUNT_REGISTER, registerUserRequest.getEmail());
        }
        
        // Trả về response
        RegisterUserResponse registerUserResponse = userMapper.toRegisterUserResponse(userEntity);
        registerUserResponse.setToken(accessToken);
        registerUserResponse.setRefreshToken(refreshToken);
        return registerUserResponse;
    }

    @Override
    public Map<String, Object> getUserInfo(OAuth2User principal, OAuth2AuthorizedClient authorizedClient) {
        String accessToken = authorizedClient.getAccessToken().getTokenValue();
        OAuth2RefreshToken oAuth2RefreshToken = authorizedClient.getRefreshToken();
        String refreshToken = (oAuth2RefreshToken != null) ? oAuth2RefreshToken.getTokenValue() : null;

        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");

        UserEntity userEntity = userRepository.findByEmailAndIsDeletedFalse(email);
        RoleEntity customerRole = roleRepository.findByRoleName(RoleEnum.CUSTOMER);

        if (userEntity == null) {
            String search = concatenateSearchField(name, "", email, email);
            UserEntity user = new UserEntity();
            user.setRole(customerRole);
            user.setPassword(UUID.randomUUID().toString());
            user.setSearch(search);
            user.setUsername(email); // Sử dụng email làm username
            user.setEmail(email);
            user.setFullName(name);
            user.setProvider("GOOGLE");
            userEntity = userRepository.save(user);
            log.info("Saved user from Google login: " + user);
        }
        tokenService.saveAccessToken(userEntity.getUserId(), accessToken, 3600);
        tokenService.saveRefreshToken(userEntity.getUserId(), refreshToken, 604800);

        Map<String, Object> response = new HashMap<>();
        response.put("user", principal.getAttributes());
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);

        return response;
    }
    private String concatenateSearchField(String fullName, String numberPhone, String email, String username) {
        return String.join("-",
                fullName != null ? fullName : "",
                numberPhone != null ? numberPhone : "",
                email != null ? email : "",
                username != null ? username : ""
        );
    }

}
