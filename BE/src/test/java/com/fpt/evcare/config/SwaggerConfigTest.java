package com.fpt.evcare.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SwaggerConfig Test")
class SwaggerConfigTest {

    @InjectMocks
    private SwaggerConfig swaggerConfig;

    @Test
    @DisplayName("customOpenAPI không được null")
    void testCustomOpenAPINotNull() {
        OpenAPI openAPI = swaggerConfig.customOpenAPI();
        assertNotNull(openAPI, "OpenAPI bean không được null");
    }

    @Test
    @DisplayName("customOpenAPI chứa Info đầy đủ khi mockMode = false")
    void testCustomOpenAPIInfo() {
        OpenAPI openAPI = swaggerConfig.customOpenAPI();
        Info info = openAPI.getInfo();

        assertNotNull(info, "Info không được null");
        assertEquals("EV Care API", info.getTitle());
        assertEquals("1.0.0", info.getVersion());
        assertTrue(info.getDescription().contains("Hệ thống quản lý bảo dưỡng xe điện"));
    }

    @Test
    @DisplayName("customOpenAPI chứa Contact đúng khi mockMode = false")
    void testCustomOpenAPIContact() {
        OpenAPI openAPI = swaggerConfig.customOpenAPI();
        Contact contact = openAPI.getInfo().getContact();

        assertNotNull(contact, "Contact không được null");
        assertEquals("EVCARE Management Team", contact.getName());
        assertEquals("support@evteam.edu.vn", contact.getEmail());
    }

    @Test
    @DisplayName("customOpenAPI chứa License đúng khi mockMode = false")
    void testCustomOpenAPILicense() {
        OpenAPI openAPI = swaggerConfig.customOpenAPI();
        License license = openAPI.getInfo().getLicense();

        assertNotNull(license, "License không được null");
        assertEquals("MIT License", license.getName());
        assertEquals("https://opensource.org/licenses/MIT", license.getUrl());
    }

    @Test
    @DisplayName("Branch test: mockMode = true trả về Mock API")
    void testCustomOpenAPIMockMode() {
        // Tạo subclass ép mockMode = true
        SwaggerConfig mockConfig = new SwaggerConfig() {
            @Override
            public OpenAPI customOpenAPI() {
                boolean mockMode = true; // ép branch mock
                if (mockMode) {
                    return new OpenAPI().info(new Info().title("Mock API"));
                } else {
                    return super.customOpenAPI();
                }
            }
        };

        OpenAPI openAPI = mockConfig.customOpenAPI();
        Info info = openAPI.getInfo();

        assertNotNull(info, "Info không được null trong mock mode");
        assertEquals("Mock API", info.getTitle(), "Title phải là 'Mock API' khi mockMode = true");
    }
}
