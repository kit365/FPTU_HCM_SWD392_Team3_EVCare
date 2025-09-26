package com.fpt.evcare.dto.request;

import com.fpt.evcare.dto.VerifyOtpRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class VerifyOtpRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testNoArgsConstructorAndSetterGetter() {
        // Test no-args constructor + setters/getters
        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("test@example.com");
        req.setOtp("123456");
        assertThat(req.getEmail()).isEqualTo("test@example.com");
        assertThat(req.getOtp()).isEqualTo("123456");

        // Test setters with null
        req.setEmail(null);
        req.setOtp(null);
        assertThat(req.getEmail()).isNull();
        assertThat(req.getOtp()).isNull();
    }

    @Test
    void testAllArgsConstructor() {
        // Test all-args constructor with valid values
        VerifyOtpRequest req = new VerifyOtpRequest("hello@domain.com", "123456");
        assertThat(req.getEmail()).isEqualTo("hello@domain.com");
        assertThat(req.getOtp()).isEqualTo("123456");

        // Test all-args constructor with null values
        VerifyOtpRequest req2 = new VerifyOtpRequest(null, null);
        assertThat(req2.getEmail()).isNull();
        assertThat(req2.getOtp()).isNull();
    }

    @Test
    void testBuilder() {
        // Test Builder with valid values
        VerifyOtpRequest req = VerifyOtpRequest.builder()
                .email("builder@test.com")
                .otp("123456")
                .build();
        assertThat(req.getEmail()).isEqualTo("builder@test.com");
        assertThat(req.getOtp()).isEqualTo("123456");

        // Test Builder with no fields set (null)
        VerifyOtpRequest req2 = VerifyOtpRequest.builder().build();
        assertThat(req2.getEmail()).isNull();
        assertThat(req2.getOtp()).isNull();

        // Test Builder with empty strings
        VerifyOtpRequest req3 = VerifyOtpRequest.builder()
                .email("")
                .otp("")
                .build();
        assertThat(req3.getEmail()).isEmpty();
        assertThat(req3.getOtp()).isEmpty();

        // Test Builder with repeated setter calls
        VerifyOtpRequest req4 = VerifyOtpRequest.builder()
                .email("first@example.com").email("second@example.com")
                .otp("123").otp("456")
                .build();
        assertThat(req4.getEmail()).isEqualTo("second@example.com");
        assertThat(req4.getOtp()).isEqualTo("456");
    }

    @Test
    void testEquals() {
        VerifyOtpRequest req1 = new VerifyOtpRequest("test@example.com", "123456");
        VerifyOtpRequest req2 = new VerifyOtpRequest("test@example.com", "123456");
        VerifyOtpRequest req3 = new VerifyOtpRequest("other@example.com", "654321");

        // Same object
        assertThat(req1).isEqualTo(req1);
        // Null comparison
        assertThat(req1).isNotEqualTo(null);
        // Different class
        assertThat(req1).isNotEqualTo("string");
        // Same values
        assertThat(req1).isEqualTo(req2);
        // Different values
        assertThat(req1).isNotEqualTo(req3);

        // Test null vs non-null for each field
        VerifyOtpRequest req4 = new VerifyOtpRequest(null, "123456");
        assertThat(req1).isNotEqualTo(req4); // email: null vs non-null
        VerifyOtpRequest req5 = new VerifyOtpRequest("test@example.com", null);
        assertThat(req1).isNotEqualTo(req5); // otp: null vs non-null

        // Test all fields null
        VerifyOtpRequest req6 = new VerifyOtpRequest(null, null);
        VerifyOtpRequest req7 = new VerifyOtpRequest(null, null);
        assertThat(req6).isEqualTo(req7);

        // Test empty string vs null
        VerifyOtpRequest req8 = new VerifyOtpRequest("", "123456");
        assertThat(req1).isNotEqualTo(req8);
    }

    @Test
    void testHashCode() {
        VerifyOtpRequest req1 = new VerifyOtpRequest("test@example.com", "123456");
        VerifyOtpRequest req2 = new VerifyOtpRequest("test@example.com", "123456");
        VerifyOtpRequest req3 = new VerifyOtpRequest("other@example.com", "654321");
        VerifyOtpRequest req6 = new VerifyOtpRequest(null, null);
        VerifyOtpRequest req7 = new VerifyOtpRequest(null, null);

        // Same values
        assertThat(req1.hashCode()).isEqualTo(req2.hashCode());
        // Different values
        assertThat(req1.hashCode()).isNotEqualTo(req3.hashCode());
        // All nulls
        assertThat(req6.hashCode()).isEqualTo(req7.hashCode());
        // Null vs non-null
        VerifyOtpRequest req4 = new VerifyOtpRequest(null, "123456");
        assertThat(req1.hashCode()).isNotEqualTo(req4.hashCode());
    }

    @Test
    void testToString() {
        // Test toString with valid values
        VerifyOtpRequest req = new VerifyOtpRequest("test@example.com", "123456");
        String str = req.toString();
        assertThat(str).contains("test@example.com", "123456");

        // Test toString with null values
        VerifyOtpRequest req2 = new VerifyOtpRequest(null, null);
        String str2 = req2.toString();
        assertThat(str2).contains("email=null", "otp=null");

        // Test toString with empty strings
        VerifyOtpRequest req3 = new VerifyOtpRequest("", "");
        String str3 = req3.toString();
        assertThat(str3).contains("email=", "otp=");
    }

    @Test
    void testValidValidation() {
        // Test valid values
        VerifyOtpRequest req = new VerifyOtpRequest("valid@example.com", "123456");
        Set<ConstraintViolation<VerifyOtpRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @Test
    void testInvalidValidation() {
        // Test empty string for email - @NotBlank violation
        VerifyOtpRequest req1 = new VerifyOtpRequest("", "123456");
        Set<ConstraintViolation<VerifyOtpRequest>> violations1 = validator.validate(req1);
        assertThat(violations1).isNotEmpty();
        assertThat(violations1).anyMatch(v -> v.getMessage().contains("must not be blank"));

        // Test invalid email format - @Email violation
        VerifyOtpRequest req2 = new VerifyOtpRequest("invalid-email", "123456");
        Set<ConstraintViolation<VerifyOtpRequest>> violations2 = validator.validate(req2);
        assertThat(violations2).isNotEmpty();
        assertThat(violations2).anyMatch(v -> v.getMessage().contains("must be a well-formed email address"));

        // Test null email - @NotBlank violation
        VerifyOtpRequest req3 = new VerifyOtpRequest(null, "123456");
        Set<ConstraintViolation<VerifyOtpRequest>> violations3 = validator.validate(req3);
        assertThat(violations3).isNotEmpty();
        assertThat(violations3).anyMatch(v -> v.getMessage().contains("must not be blank"));

        // Test empty otp - @NotBlank violation
        VerifyOtpRequest req4 = new VerifyOtpRequest("valid@example.com", "");
        Set<ConstraintViolation<VerifyOtpRequest>> violations4 = validator.validate(req4);
        assertThat(violations4).isNotEmpty();
        assertThat(violations4).anyMatch(v -> v.getMessage().contains("must not be blank"));

        // Test null otp - @NotBlank violation
        VerifyOtpRequest req5 = new VerifyOtpRequest("valid@example.com", null);
        Set<ConstraintViolation<VerifyOtpRequest>> violations5 = validator.validate(req5);
        assertThat(violations5).isNotEmpty();
        assertThat(violations5).anyMatch(v -> v.getMessage().contains("must not be blank"));
    }
}