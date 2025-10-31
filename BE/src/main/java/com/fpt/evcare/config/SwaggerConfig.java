package com.fpt.evcare.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    private static final String API_TITLE = "EV Care API";
    private static final String API_VERSION = "1.0.0";
    private static final String API_DESCRIPTION = """
            Hệ thống quản lý bảo dưỡng xe điện cho trung tâm dịch vụ,
            phát triển với Spring Boot 3.5.5.
            
            ## Tính năng chính:
            - Quản lý khách hàng và hồ sơ xe điện
            - Theo dõi lịch bảo dưỡng định kỳ, nhắc nhở qua km/thời gian
            - Đặt lịch dịch vụ trực tuyến (bảo dưỡng, sửa chữa)
            - Quản lý trung tâm dịch vụ và loại dịch vụ cung cấp
            - Quản lý lịch sử bảo dưỡng & chi phí
            - Thanh toán online (e-wallet, banking, ...)
            - Hệ thống thông báo trạng thái (chờ – đang bảo dưỡng – hoàn tất)
            
            ## Tech Stack:
            - Java 21 + Spring Boot 3.5.5
            - PostgreSQL + Redis Cache
            - Docker + Docker Compose
            """;

    private static final String CONTACT_NAME = "EVCARE Management Team";
    private static final String CONTACT_EMAIL = "support@evteam.edu.vn";

    private static final String LICENSE_NAME = "MIT License";
    private static final String LICENSE_URL = "https://opensource.org/licenses/MIT";
    
    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";
    private static final String BEARER_FORMAT = "JWT";
    private static final String SCHEME = "bearer";

    // ========== Bean ==========
    @Bean
    public OpenAPI customOpenAPI() {
        // Chuyển thành true để test bằng Mockito
        boolean mockMode = false;

        Contact contact = new Contact()
                .name(CONTACT_NAME)
                .email(CONTACT_EMAIL);

        License license = new License()
                .name(LICENSE_NAME)
                .url(LICENSE_URL);

        Info info = new Info()
                .title(API_TITLE)
                .version(API_VERSION)
                .description(API_DESCRIPTION)
                .contact(contact)
                .license(license);

        if (mockMode) {
            return new OpenAPI().info(new Info().title("Mock API"));
        } else {
            // Tạo Security Scheme cho JWT Bearer token
            SecurityScheme securityScheme = new SecurityScheme()
                    .name(SECURITY_SCHEME_NAME)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme(SCHEME)
                    .bearerFormat(BEARER_FORMAT)
                    .in(SecurityScheme.In.HEADER)
                    .description("Nhập JWT token để authenticate. Ví dụ: Bearer eyJhbGci...");

            // Tạo Security Requirement
            SecurityRequirement securityRequirement = new SecurityRequirement()
                    .addList(SECURITY_SCHEME_NAME);

            // Tạo Components với Security Scheme
            Components components = new Components()
                    .addSecuritySchemes(SECURITY_SCHEME_NAME, securityScheme);

            return new OpenAPI()
                    .info(info)
                    .components(components)
                    .addSecurityItem(securityRequirement);
        }
    }

}
