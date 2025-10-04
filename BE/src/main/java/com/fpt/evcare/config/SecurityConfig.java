package com.fpt.evcare.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
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
                        .anyRequest().authenticated() // yêu cầu login mới truy cập
                )
                .oauth2Login()
                .and()
                .logout(logout -> logout
                        .logoutUrl("/logout")                 // URL để logout
                        .logoutSuccessUrl("/")                // sau khi logout sẽ redirect về /
                        .invalidateHttpSession(true)          // huỷ session
                        .clearAuthentication(true)            // clear Authentication
                        .deleteCookies("JSESSIONID"))
        ; // bật login bằng Google OAuth2 (hoặc các provider khác)

        return http.build();
    }
}
