package com.fpt.evcare.dto.request;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ResetPasswordRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testNoArgsConstructorAndSetterGetter() {
        // Test no-args constructor + setters/getters
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setEmail("test@example.com");
        req.setOtp("123456");
        req.setNewPassword("newPass123");
        assertThat(req.getEmail()).isEqualTo("test@example.com");
        assertThat(req.getOtp()).isEqualTo("123456");
        assertThat(req.getNewPassword()).isEqualTo("newPass123");

        // Test setters with null
        req.setEmail(null);
        req.setOtp(null);
        req.setNewPassword(null);
        assertThat(req.getEmail()).isNull();
        assertThat(req.getOtp()).isNull();
        assertThat(req.getNewPassword()).isNull();
    }

    @Test
    void testAllArgsConstructor() {
        // Test all-args constructor with valid values
        ResetPasswordRequest req = new ResetPasswordRequest("hello@domain.com", "123456", "newPass123");
        assertThat(req.getEmail()).isEqualTo("hello@domain.com");
        assertThat(req.getOtp()).isEqualTo("123456");
        assertThat(req.getNewPassword()).isEqualTo("newPass123");

        // Test all-args constructor with null values
        ResetPasswordRequest req2 = new ResetPasswordRequest(null, null, null);
        assertThat(req2.getEmail()).isNull();
        assertThat(req2.getOtp()).isNull();
        assertThat(req2.getNewPassword()).isNull();
    }

    @Test
    void testBuilder() {
        // Test Builder with valid values
        ResetPasswordRequest req = ResetPasswordRequest.builder()
                .email("builder@test.com")
                .otp("123456")
                .newPassword("newPass123")
                .build();
        assertThat(req.getEmail()).isEqualTo("builder@test.com");
        assertThat(req.getOtp()).isEqualTo("123456");
        assertThat(req.getNewPassword()).isEqualTo("newPass123");

        // Test Builder with no fields set (null)
        ResetPasswordRequest req2 = ResetPasswordRequest.builder().build();
        assertThat(req2.getEmail()).isNull();
        assertThat(req2.getOtp()).isNull();
        assertThat(req2.getNewPassword()).isNull();

        // Test Builder with empty strings
        ResetPasswordRequest req3 = ResetPasswordRequest.builder()
                .email("")
                .otp("")
                .newPassword("")
                .build();
        assertThat(req3.getEmail()).isEmpty();
        assertThat(req3.getOtp()).isEmpty();
        assertThat(req3.getNewPassword()).isEmpty();

        // Test Builder with repeated setter calls
        ResetPasswordRequest req4 = ResetPasswordRequest.builder()
                .email("first@example.com").email("second@example.com")
                .otp("123").otp("456")
                .newPassword("pass1").newPassword("pass2")
                .build();
        assertThat(req4.getEmail()).isEqualTo("second@example.com");
        assertThat(req4.getOtp()).isEqualTo("456");
        assertThat(req4.getNewPassword()).isEqualTo("pass2");
    }

    @Test
    void testEquals() {
        ResetPasswordRequest req1 = new ResetPasswordRequest("test@example.com", "123456", "newPass123");
        ResetPasswordRequest req2 = new ResetPasswordRequest("test@example.com", "123456", "newPass123");
        ResetPasswordRequest req3 = new ResetPasswordRequest("other@example.com", "654321", "differentPass");

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
        ResetPasswordRequest req4 = new ResetPasswordRequest(null, "123456", "newPass123");
        assertThat(req1).isNotEqualTo(req4); // email: null vs non-null
        ResetPasswordRequest req5 = new ResetPasswordRequest("test@example.com", null, "newPass123");
        assertThat(req1).isNotEqualTo(req5); // otp: null vs non-null
        ResetPasswordRequest req6 = new ResetPasswordRequest("test@example.com", "123456", null);
        assertThat(req1).isNotEqualTo(req6); // newPassword: null vs non-null

        // Test all fields null
        ResetPasswordRequest req7 = new ResetPasswordRequest(null, null, null);
        ResetPasswordRequest req8 = new ResetPasswordRequest(null, null, null);
        assertThat(req7).isEqualTo(req8);

        // Test empty string vs null
        ResetPasswordRequest req9 = new ResetPasswordRequest("", "123456", "newPass123");
        assertThat(req1).isNotEqualTo(req9);
    }

    @Test
    void testHashCode() {
        ResetPasswordRequest req1 = new ResetPasswordRequest("test@example.com", "123456", "newPass123");
        ResetPasswordRequest req2 = new ResetPasswordRequest("test@example.com", "123456", "newPass123");
        ResetPasswordRequest req3 = new ResetPasswordRequest("other@example.com", "654321", "differentPass");
        ResetPasswordRequest req7 = new ResetPasswordRequest(null, null, null);
        ResetPasswordRequest req8 = new ResetPasswordRequest(null, null, null);

        // Same values
        assertThat(req1.hashCode()).isEqualTo(req2.hashCode());
        // Different values
        assertThat(req1.hashCode()).isNotEqualTo(req3.hashCode());
        // All nulls
        assertThat(req7.hashCode()).isEqualTo(req8.hashCode());
        // Null vs non-null
        ResetPasswordRequest req4 = new ResetPasswordRequest(null, "123456", "newPass123");
        assertThat(req1.hashCode()).isNotEqualTo(req4.hashCode());
    }

    @Test
    void testToString() {
        // Test toString with valid values
        ResetPasswordRequest req = new ResetPasswordRequest("test@example.com", "123456", "newPass123");
        String str = req.toString();
        assertThat(str).contains("test@example.com", "123456", "newPass123");

        // Test toString with null values
        ResetPasswordRequest req2 = new ResetPasswordRequest(null, null, null);
        String str2 = req2.toString();
        assertThat(str2).contains("email=null", "otp=null", "newPassword=null");

        // Test toString with empty strings
        ResetPasswordRequest req3 = new ResetPasswordRequest("", "", "");
        String str3 = req3.toString();
        assertThat(str3).contains("email=", "otp=", "newPassword=");
    }

    @Test
    void testValidValidation() {
        // Test valid values
        ResetPasswordRequest req = new ResetPasswordRequest("valid@example.com", "123456", "newPass123");
        Set<ConstraintViolation<ResetPasswordRequest>> violations = validator.validate(req);
        assertThat(violations).isEmpty();
    }

    @Test
    void testInvalidValidation() {
        // Test empty string for email - @NotBlank violation
        ResetPasswordRequest req1 = new ResetPasswordRequest("", "123456", "newPass123");
        Set<ConstraintViolation<ResetPasswordRequest>> violations1 = validator.validate(req1);
        assertThat(violations1).isNotEmpty();
        assertThat(violations1).anyMatch(v -> v.getMessage().contains("must not be blank"));

        // Test invalid email format - @Email violation
        ResetPasswordRequest req2 = new ResetPasswordRequest("invalid-email", "123456", "newPass123");
        Set<ConstraintViolation<ResetPasswordRequest>> violations2 = validator.validate(req2);
        assertThat(violations2).isNotEmpty();
        assertThat(violations2).anyMatch(v -> v.getMessage().contains("must be a well-formed email address"));

        // Test null email - @NotBlank violation
        ResetPasswordRequest req3 = new ResetPasswordRequest(null, "123456", "newPass123");
        Set<ConstraintViolation<ResetPasswordRequest>> violations3 = validator.validate(req3);
        assertThat(violations3).isNotEmpty();
        assertThat(violations3).anyMatch(v -> v.getMessage().contains("must not be blank"));

        // Test empty otp - @NotBlank violation
        ResetPasswordRequest req4 = new ResetPasswordRequest("valid@example.com", "", "newPass123");
        Set<ConstraintViolation<ResetPasswordRequest>> violations4 = validator.validate(req4);
        assertThat(violations4).isNotEmpty();
        assertThat(violations4).anyMatch(v -> v.getMessage().contains("must not be blank"));

        // Test null otp - @NotBlank violation
        ResetPasswordRequest req5 = new ResetPasswordRequest("valid@example.com", null, "newPass123");
        Set<ConstraintViolation<ResetPasswordRequest>> violations5 = validator.validate(req5);
        assertThat(violations5).isNotEmpty();
        assertThat(violations5).anyMatch(v -> v.getMessage().contains("must not be blank"));

        // Test empty newPassword - @NotBlank violation
        ResetPasswordRequest req6 = new ResetPasswordRequest("valid@example.com", "123456", "");
        Set<ConstraintViolation<ResetPasswordRequest>> violations6 = validator.validate(req6);
        assertThat(violations6).isNotEmpty();
        assertThat(violations6).anyMatch(v -> v.getMessage().contains("must not be blank"));

        // Test null newPassword - @NotBlank violation
        ResetPasswordRequest req7 = new ResetPasswordRequest("valid@example.com", "123456", null);
        Set<ConstraintViolation<ResetPasswordRequest>> violations7 = validator.validate(req7);
        assertThat(violations7).isNotEmpty();
        assertThat(violations7).anyMatch(v -> v.getMessage().contains("must not be blank"));
    }
}