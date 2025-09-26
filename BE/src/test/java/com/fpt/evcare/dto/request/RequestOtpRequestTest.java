package com.fpt.evcare.dto.request;

import com.fpt.evcare.dto.request.RequestOtpRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RequestOtpRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testNoArgsConstructorAndSetterGetter() {
        // Test no-args constructor + setter/getter
        RequestOtpRequest req = new RequestOtpRequest();
        req.setEmail("test@example.com");
        assertThat(req.getEmail()).isEqualTo("test@example.com");

        // Test setter with null
        req.setEmail(null);
        assertThat(req.getEmail()).isNull();
    }

    @Test
    void testAllArgsConstructor() {
        // Test all-args constructor with valid email
        RequestOtpRequest req = new RequestOtpRequest("hello@domain.com");
        assertThat(req.getEmail()).isEqualTo("hello@domain.com");

        // Test all-args constructor with null
        RequestOtpRequest req2 = new RequestOtpRequest(null);
        assertThat(req2.getEmail()).isNull();
    }

    @Test
    void testBuilder() {
        // Test Builder with valid email
        RequestOtpRequest req = RequestOtpRequest.builder()
                .email("builder@test.com")
                .build();
        assertThat(req.getEmail()).isEqualTo("builder@test.com");

        // Test Builder with no email set (null)
        RequestOtpRequest req2 = RequestOtpRequest.builder().build();
        assertThat(req2.getEmail()).isNull();

        // Test Builder with empty string
        RequestOtpRequest req3 = RequestOtpRequest.builder()
                .email("")
                .build();
        assertThat(req3.getEmail()).isEmpty();

        // Test Builder with repeated setter calls
        RequestOtpRequest req4 = RequestOtpRequest.builder()
                .email("first@example.com")
                .email("second@example.com")
                .build();
        assertThat(req4.getEmail()).isEqualTo("second@example.com");
    }

    @Test
    void testEquals() {
        RequestOtpRequest req1 = new RequestOtpRequest("test@example.com");
        RequestOtpRequest req2 = new RequestOtpRequest("test@example.com");
        RequestOtpRequest req3 = new RequestOtpRequest("other@example.com");
        RequestOtpRequest req4 = new RequestOtpRequest(null);

        // Same object
        assertThat(req1).isEqualTo(req1);
        // Null comparison
        assertThat(req1).isNotEqualTo(null);
        // Different class
        assertThat(req1).isNotEqualTo("string");
        // Same email value
        assertThat(req1).isEqualTo(req2);
        // Different email value
        assertThat(req1).isNotEqualTo(req3);
        // Null email vs non-null email
        assertThat(req1).isNotEqualTo(req4);
        // Both null email
        RequestOtpRequest req5 = new RequestOtpRequest(null);
        assertThat(req4).isEqualTo(req5);
        // Empty string vs null
        RequestOtpRequest req6 = new RequestOtpRequest("");
        assertThat(req1).isNotEqualTo(req6);
    }

    @Test
    void testHashCode() {
        RequestOtpRequest req1 = new RequestOtpRequest("test@example.com");
        RequestOtpRequest req2 = new RequestOtpRequest("test@example.com");
        RequestOtpRequest req3 = new RequestOtpRequest("other@example.com");
        RequestOtpRequest req4 = new RequestOtpRequest(null);
        RequestOtpRequest req5 = new RequestOtpRequest(null);

        // Same email value
        assertThat(req1.hashCode()).isEqualTo(req2.hashCode());
        // Different email value
        assertThat(req1.hashCode()).isNotEqualTo(req3.hashCode());
        // Null email
        assertThat(req4.hashCode()).isEqualTo(req5.hashCode());
        // Null vs non-null email
        assertThat(req1.hashCode()).isNotEqualTo(req4.hashCode());
    }

    @Test
    void testToString() {
        // Test toString with valid email
        RequestOtpRequest req = new RequestOtpRequest("test@example.com");
        String str = req.toString();
        assertThat(str).contains("test@example.com");

        // Test toString with null email
        RequestOtpRequest req2 = new RequestOtpRequest(null);
        String str2 = req2.toString();
        assertThat(str2).contains("email=null");

        // Test toString with empty email
        RequestOtpRequest req3 = new RequestOtpRequest("");
        String str3 = req3.toString();
        assertThat(str3).contains("email=");
    }

    @Test
    void testValidEmailValidation() {
        // Test valid email
        RequestOtpRequest req = new RequestOtpRequest("valid@example.com");
        Set<ConstraintViolation<RequestOtpRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }


    @Test
    void testInvalidEmailValidation() {
        // Test empty string - @NotBlank violation
        RequestOtpRequest req1 = new RequestOtpRequest("");
        Set<ConstraintViolation<RequestOtpRequest>> violations1 = validator.validate(req1);
        assertThat(violations1).isNotEmpty();

        // Kiểm tra thông báo lỗi cho @NotBlank (có thể là "must not be blank" hoặc tùy chỉnh)
        assertThat(violations1).anyMatch(v ->
                v.getMessage().contains("blank") ||
                        v.getMessage().contains("empty") ||
                        v.getMessage().contains("null")
        );

        // In ra thông báo lỗi thực tế để debug (xóa sau khi fix)
        violations1.forEach(v -> System.out.println("Empty string violation: " + v.getMessage()));

        // Test invalid email format - @Email violation
        RequestOtpRequest req2 = new RequestOtpRequest("invalid-email");
        Set<ConstraintViolation<RequestOtpRequest>> violations2 = validator.validate(req2);
        assertThat(violations2).isNotEmpty();

        // Kiểm tra thông báo lỗi cho @Email (có thể là "must be a well-formed email address" hoặc tùy chỉnh)
        assertThat(violations2).anyMatch(v ->
                v.getMessage().contains("email") ||
                        v.getMessage().contains("format") ||
                        v.getMessage().contains("valid")
        );

        // In ra thông báo lỗi thực tế để debug
        violations2.forEach(v -> System.out.println("Invalid email violation: " + v.getMessage()));

        // Test null email - @NotNull hoặc @NotBlank violation
        RequestOtpRequest req3 = new RequestOtpRequest(null);
        Set<ConstraintViolation<RequestOtpRequest>> violations3 = validator.validate(req3);
        assertThat(violations3).isNotEmpty();

        // Kiểm tra thông báo lỗi cho null (có thể là @NotNull hoặc @NotBlank)
        assertThat(violations3).anyMatch(v ->
                v.getMessage().contains("null") ||
                        v.getMessage().contains("blank")
        );

    }
}