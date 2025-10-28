package com.fpt.evcare.config;

import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.security.NimbusJwtAuthenticationFilter;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@AllArgsConstructor
public class SecurityConfig {

    private final NimbusJwtAuthenticationFilter nimbusJwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .disable() // Disable CSRF completely for WebSocket support
                )
                .authorizeHttpRequests(auth -> auth
                        // WebSocket endpoints
                        .requestMatchers("/ws/**", "/ws/info", "/app/**").permitAll()
                        // Swagger endpoints - MUST be first
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/configuration/**"
                        ).permitAll()
                        // OAuth2 flow endpoints
                        .requestMatchers(
                                "/oauth2/**",
                                "/login/oauth2/**"
                        ).permitAll()
                        // Public auth endpoints (không cần đăng nhập)
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/api/v1/forgot-password/**"
                        ).permitAll()
                        // OAuth2 user info endpoint (cần OAuth2 authentication)
                        .requestMatchers(AuthConstants.GET_USER_INFO).authenticated()
                        // All other requests need authentication
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage(AuthConstants.LOGIN_GOOGLE)
                        .defaultSuccessUrl(AuthConstants.GET_USER_INFO, true)
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            String path = request.getServletPath();
                            // Don't redirect Swagger/API endpoints to Google login
                            if (path.startsWith("/api/") || 
                                path.startsWith("/v3/api-docs") ||
                                path.startsWith("/api-docs") ||
                                path.startsWith("/swagger-ui") ||
                                path.startsWith("/swagger-resources") ||
                                path.startsWith("/webjars") ||
                                path.startsWith("/configuration")) {
                                response.setStatus(401);
                                response.setContentType("application/json;charset=UTF-8");
                                response.setCharacterEncoding("UTF-8");
                                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Không có quyền truy cập\"}");
                            } else {
                                // Only redirect browser requests to Google login
                                response.sendRedirect(AuthConstants.LOGIN_GOOGLE);
                            }
                        })
                )
                .logout(logout -> logout
                        .logoutUrl(AuthConstants.LOGOUT_GOOGLE)
                        .logoutSuccessUrl(AuthConstants.LOGIN_GOOGLE)
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                );
        http.addFilterBefore(nimbusJwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}
