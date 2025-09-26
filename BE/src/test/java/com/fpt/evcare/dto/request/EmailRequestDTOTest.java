package com.fpt.evcare.dto.request;

import com.fpt.evcare.dto.EmailRequestDTO;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmailRequestDTOTest {

    @Test
    void testNoArgsConstructorAndSetters() {
        // Test no-args constructor + setters (all non-null)
        EmailRequestDTO dto = new EmailRequestDTO();
        dto.setTo("to@example.com");
        dto.setSubject("subject");
        dto.setText("text");
        dto.setFullName("fullName");
        dto.setCode("code");

        assertThat(dto.getTo()).isEqualTo("to@example.com");
        assertThat(dto.getSubject()).isEqualTo("subject");
        assertThat(dto.getText()).isEqualTo("text");
        assertThat(dto.getFullName()).isEqualTo("fullName");
        assertThat(dto.getCode()).isEqualTo("code");
    }

    @Test
    void testAllArgsConstructor() {
        // Test all-args constructor (mix of null and non-null)
        EmailRequestDTO dto = new EmailRequestDTO(null, "sub", null, "name", "code2");
        assertThat(dto.getTo()).isNull();
        assertThat(dto.getSubject()).isEqualTo("sub");
        assertThat(dto.getText()).isNull();
        assertThat(dto.getFullName()).isEqualTo("name");
        assertThat(dto.getCode()).isEqualTo("code2");
    }



    @Test
    void testEquals() {
        EmailRequestDTO dto = new EmailRequestDTO("to@example.com", "subject", "text", "fullName", "code");
        EmailRequestDTO dto2 = new EmailRequestDTO(null, "sub", null, "name", "code2");
        EmailRequestDTO dto4 = new EmailRequestDTO("to@example.com", "subject", "text", "fullName", "code");

        // Same object
        assertThat(dto).isEqualTo(dto);
        // Null comparison
        assertThat(dto).isNotEqualTo(null);
        // Different class
        assertThat(dto).isNotEqualTo("string");
        // Different field values
        assertThat(dto).isNotEqualTo(dto2);
        // Same field values
        assertThat(dto).isEqualTo(dto4);

        // One field differs
        EmailRequestDTO dto5 = new EmailRequestDTO("to@example.com", "different", "text", "fullName", "code");
        assertThat(dto).isNotEqualTo(dto5);
        // Null vs non-null field
        EmailRequestDTO dto6 = new EmailRequestDTO("to@example.com", null, "text", "fullName", "code");
        assertThat(dto).isNotEqualTo(dto6);
        // Empty string vs null
        EmailRequestDTO dto7 = new EmailRequestDTO("to@example.com", "", "text", "fullName", "code");
        assertThat(dto).isNotEqualTo(dto7);
        // All fields null
        EmailRequestDTO dto8 = new EmailRequestDTO(null, null, null, null, null);
        EmailRequestDTO dto9 = new EmailRequestDTO(null, null, null, null, null);
        assertThat(dto8).isEqualTo(dto9);
        // One field null, others equal
        EmailRequestDTO dto10 = new EmailRequestDTO(null, "subject", "text", "fullName", "code");
        assertThat(dto).isNotEqualTo(dto10);
    }

    @Test
    void testHashCode() {
        EmailRequestDTO dto = new EmailRequestDTO("to@example.com", "subject", "text", "fullName", "code");
        EmailRequestDTO dto2 = new EmailRequestDTO(null, "sub", null, "name", "code2");
        EmailRequestDTO dto4 = new EmailRequestDTO("to@example.com", "subject", "text", "fullName", "code");
        EmailRequestDTO dto8 = new EmailRequestDTO(null, null, null, null, null);
        EmailRequestDTO dto9 = new EmailRequestDTO(null, null, null, null, null);
        EmailRequestDTO dto11 = new EmailRequestDTO("to@example.com", null, null, "fullName", "code");
        EmailRequestDTO dto12 = new EmailRequestDTO("to@example.com", null, null, "fullName", "code");

        assertThat(dto.hashCode()).isEqualTo(dto4.hashCode()); // Same values
        assertThat(dto.hashCode()).isNotEqualTo(dto2.hashCode()); // Different values
        assertThat(dto8.hashCode()).isEqualTo(dto9.hashCode()); // All nulls
        assertThat(dto11.hashCode()).isEqualTo(dto12.hashCode()); // Same with some null fields
        assertThat(dto11.hashCode()).isNotEqualTo(dto.hashCode()); // Different values
    }

    @Test
    void testToString() {
        EmailRequestDTO dto3 = EmailRequestDTO.builder()
                .to("builder@example.com")
                .subject(null)
                .text("builder text")
                .fullName(null)
                .code("000")
                .build();
        EmailRequestDTO dto8 = new EmailRequestDTO(null, null, null, null, null);
        EmailRequestDTO dto13 = new EmailRequestDTO("", "", "", "", "");

        String str = dto3.toString();
        assertThat(str).contains("builder@example.com", "builder text", "code=000", "subject=null", "fullName=null");

        String nullStr = dto8.toString();
        assertThat(nullStr).contains("to=null", "subject=null", "text=null", "fullName=null", "code=null");

        String emptyStr = dto13.toString();
        assertThat(emptyStr).contains("to=", "subject=", "text=", "fullName=", "code=");
    }
}