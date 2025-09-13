package com.fpt.evcare.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {

        Contact contact = new Contact();
        contact.setName("EVCARE Management Team");
        contact.setEmail("support@evteam.edu.vn");

        Info infor = new Info()
                .title("EV Care API")
                .version("1.0.0")
                .description("""
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
                        """);

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        return new OpenAPI().info(infor.contact(contact).license(license));
    }
}
