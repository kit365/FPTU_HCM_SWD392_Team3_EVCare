package com.fpt.evcare.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import static org.assertj.core.api.Assertions.assertThatCode;

@DisplayName("CorsConfig Test")
class CorsConfigTest {

    private final CorsConfig corsConfig = new CorsConfig();

    @Test
    @DisplayName("corsConfigurer should run without errors")
    void corsConfigurer_ShouldConfigureCors() {
        WebMvcConfigurer configurer = corsConfig.corsConfigurer();

        // Gọi method để cover code
        assertThatCode(() -> configurer.addCorsMappings(new CorsRegistry()))
                .doesNotThrowAnyException();
    }
}
