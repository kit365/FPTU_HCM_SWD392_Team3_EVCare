package com.fpt.evcare.config;

import com.fpt.evcare.constants.AuthConstants;
import com.fpt.evcare.security.NimbusJwtAuthenticationFilter;
import com.fpt.evcare.security.OAuth2SuccessHandler;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@AllArgsConstructor
public class SecurityConfig {

    private final NimbusJwtAuthenticationFilter nimbusJwtAuthenticationFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) 
                .csrf(AbstractHttpConfigurer::disable
                )
                .authorizeHttpRequests(auth -> auth
                        // WebSocket endpoints - must allow ALL SockJS endpoints and transports
                        .requestMatchers("/ws/**", "/app/**", "/topic/**", "/queue/**", "/user/**").permitAll()
                        .requestMatchers("/ws/info/**").permitAll()
                        .requestMatchers("/ws/*/*/websocket").permitAll()
                        .requestMatchers("/ws/*/*/xhr_streaming").permitAll()
                        .requestMatchers("/ws/*/*/xhr").permitAll()
        
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
                        // VNPay payment endpoints (public - guest cũng có thể thanh toán)
                        .requestMatchers("/api/v1/vnpay/create-payment").permitAll()
                        .requestMatchers("/api/v1/vnpay/payment-return").permitAll()
                        // Invoice endpoints (public - guest cần xem invoice để thanh toán)
                        .requestMatchers("/api/v1/invoice/appointment/**").permitAll()
                        .requestMatchers("/api/v1/invoice/*/pay-cash").permitAll() // Cho phép guest thanh toán CASH (invoiceId là một segment)
                        // Public auth endpoints (không cần đăng nhập)
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/api/v1/forgot-password/**"
                        ).permitAll()
                        // Public endpoints cho booking (không cần đăng nhập)
                        .requestMatchers(
                                "/api/v1/vehicle-type/**",  // Xem mẫu xe
                                "/api/v1/service-type/**",  // Xem dịch vụ
                                "/api/v1/appointment/service-mode",  // Service mode enum
                                "/api/v1/appointment/service-mode/",  // Service mode enum (with trailing slash)
                                "/api/v1/appointment/search/guest",   // Guest search appointment
                                "/api/v1/appointment/search/guest/**",   // Guest search appointment (with trailing slash and params)
                                "/api/v1/appointment/guest/*/send-otp",  // Guest send OTP (appointmentId is single segment)
                                "/api/v1/appointment/guest/*/verify-otp",  // Guest verify OTP (appointmentId is single segment)
                                "/api/v1/appointment/guest/*"  // Guest update appointment (appointmentId is single segment, PATCH method)
                        ).permitAll()
                        // POST appointment creation - cho phép cả guest và authenticated
                        .requestMatchers(HttpMethod.POST, "/api/v1/appointment/").permitAll()
                        // Message endpoints (cần authenticate qua JWT filter)
                        .requestMatchers("/api/v1/messages/**").authenticated()
                        // OAuth2 user info endpoint (cần OAuth2 authentication)
                        .requestMatchers(AuthConstants.GET_USER_INFO).authenticated()
                        // All other requests need authentication
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage(AuthConstants.LOGIN_GOOGLE)
                        .successHandler(oAuth2SuccessHandler)
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
