package com.fpt.evcare.security;

import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.entity.UserEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.repository.UserRepository;
import com.fpt.evcare.service.TokenService;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TokenService tokenService;

    @Value("${frontend.url:http://localhost:5000}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            handleSuccess(request, response, authentication);
        } catch (Exception e) {
            log.error("❌ Error in Google OAuth2 login: {}", e.getMessage(), e);
            String errorMessage = e.getMessage() != null ? e.getMessage() : "unknown_error";
            response.sendRedirect(frontendUrl + "/client/login?error=" + errorMessage);
        }
    }

    @Transactional
    public void handleSuccess(HttpServletRequest request, HttpServletResponse response,
                              Authentication authentication) throws IOException, JOSEException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        log.info("Google OAuth2 login successful for email: {}", email);

        // Find or create user
        UserEntity userEntity = userRepository.findByEmailAndIsDeletedFalse(email);
        
        if (userEntity == null) {
            // Create new user from Google account
            RoleEntity customerRole = roleRepository.findByRoleName(RoleEnum.CUSTOMER);
            
            userEntity = new UserEntity();
            userEntity.setRole(customerRole);
            userEntity.setPassword(UUID.randomUUID().toString()); // Random password for OAuth users
            userEntity.setSearch(concatenateSearchField(name, "", email, email));
            userEntity.setUsername(email);
            userEntity.setEmail(email);
            userEntity.setFullName(name);
            userEntity.setProvider("GOOGLE");
            
            userEntity = userRepository.save(userEntity);
            log.info("Created new user from Google OAuth2: {}", email);
        } else {
            // User already exists - update provider if not already set to GOOGLE
            if (!"GOOGLE".equals(userEntity.getProvider())) {
                userEntity.setProvider("GOOGLE");
                userEntity = userRepository.save(userEntity);
                log.info("Updated existing user provider to GOOGLE: {}", email);
            }
        }

        // Generate JWT tokens for our system
        String accessToken = tokenService.generateAccessToken(userEntity.getUserId());
        String refreshToken = tokenService.generateRefreshToken(userEntity.getUserId());

        // Save tokens to Redis
        tokenService.saveAccessToken(userEntity.getUserId(), accessToken, 3600); // 1 hour
        tokenService.saveRefreshToken(userEntity.getUserId(), refreshToken, 604800); // 7 days

        log.info("Generated and saved system tokens for Google user: {}", email);

        // URL-encode parameters to handle Unicode characters (e.g., Vietnamese names)
        String encodedEmail = UriUtils.encode(email, StandardCharsets.UTF_8);
        String encodedName = name != null ? UriUtils.encode(name, StandardCharsets.UTF_8) : "";

        // Redirect directly to homepage with tokens (no intermediate callback page)
        String frontendCallbackUrl = String.format(
            "%s/?googleAuth=true&accessToken=%s&refreshToken=%s&email=%s&name=%s",
            frontendUrl,
            accessToken,
            refreshToken,
            encodedEmail,
            encodedName
        );

        log.info("Redirecting to frontend: {}", frontendCallbackUrl);
        getRedirectStrategy().sendRedirect(request, response, frontendCallbackUrl);
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

