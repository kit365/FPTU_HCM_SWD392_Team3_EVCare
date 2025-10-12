package com.fpt.evcare.config;

import com.fpt.evcare.constants.AuthConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(AuthConstants.GET_USER_INFO).authenticated()
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage(AuthConstants.LOGIN_GOOGLE) // Trang login Google
                        .defaultSuccessUrl(AuthConstants.GET_USER_INFO, true) // Sau login thì redirect về user info
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            // Nếu chưa login → chuyển hướng sang Google login
                            response.sendRedirect(AuthConstants.LOGIN_GOOGLE);
                        })
                )
                .logout(logout -> logout
                        .logoutUrl(AuthConstants.LOGOUT_GOOGLE)
                        .logoutSuccessUrl(AuthConstants.LOGIN_GOOGLE)
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                );

        return http.build();
    }

}
