package com.fpt.evcare.config;

import lombok.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${frontend.url:http://localhost:5000}")
    private String frontendUrl;

    private static final String[] DEFAULT_ALLOWED_ORIGINS = {
            "http://localhost:3000",
            "http://localhost:5000",
            "http://localhost:5173",  // Vite default port
            "http://localhost:4173",   // Vite preview port
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:4173"
    };

    // Define constant array for allowed methods
    private static final String[] ALLOWED_METHODS = {
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH"
    };


    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                // Combine default origins with configured frontend URL
                List<String> allowedOrigins = new ArrayList<>(Arrays.asList(DEFAULT_ALLOWED_ORIGINS));
                if (!allowedOrigins.contains(frontendUrl)) {
                    allowedOrigins.add(frontendUrl);
                }
                
                registry.addMapping("/**")
                        .allowedOrigins(allowedOrigins.toArray(new String[0])) 
                        .allowedHeaders("*")
                        .allowedMethods(ALLOWED_METHODS)
                        .allowCredentials(true)
                        .maxAge(3600); 
            }
        };
    }
}
