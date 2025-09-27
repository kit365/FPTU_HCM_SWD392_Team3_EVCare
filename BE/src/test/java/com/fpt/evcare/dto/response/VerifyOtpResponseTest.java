package com.fpt.evcare.dto.response;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VerifyOtpResponseTest {

    @Test
    void testNoArgsConstructorAndSetterGetter() {
        VerifyOtpResponse response = new VerifyOtpResponse();
        assertThat(response.isValid()).isFalse();

        response.setValid(true);
        assertThat(response.isValid()).isTrue();

        response.setValid(false);
        assertThat(response.isValid()).isFalse();
    }

    @Test
    void testAllArgsConstructor() {
        VerifyOtpResponse responseTrue = new VerifyOtpResponse(true);
        assertThat(responseTrue.isValid()).isTrue();

        VerifyOtpResponse responseFalse = new VerifyOtpResponse(false);
        assertThat(responseFalse.isValid()).isFalse();
    }

    @Test
    void testBuilder() {
        VerifyOtpResponse responseTrue = VerifyOtpResponse.builder()
                .isValid(true)
                .build();
        assertThat(responseTrue.isValid()).isTrue();

        VerifyOtpResponse responseFalse = VerifyOtpResponse.builder()
                .isValid(false)
                .build();
        assertThat(responseFalse.isValid()).isFalse();

        VerifyOtpResponse responseDefault = VerifyOtpResponse.builder()
                .build();
        assertThat(responseDefault.isValid()).isFalse();

        VerifyOtpResponse responseOverride = VerifyOtpResponse.builder()
                .isValid(true)
                .isValid(false)
                .build();
        assertThat(responseOverride.isValid()).isFalse();
    }



    @Test
    void testToString() {
        VerifyOtpResponse responseTrue = new VerifyOtpResponse(true);
        assertThat(responseTrue.toString()).contains("isValid=true");

        VerifyOtpResponse responseFalse = new VerifyOtpResponse(false);
        assertThat(responseFalse.toString()).contains("isValid=false");
    }

    @Test
    void testJsonSerialization() throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        VerifyOtpResponse responseTrue = new VerifyOtpResponse(true);
        String jsonTrue = mapper.writeValueAsString(responseTrue);
        assertThat(jsonTrue).contains("\"isValid\":true");

        VerifyOtpResponse responseFalse = new VerifyOtpResponse(false);
        String jsonFalse = mapper.writeValueAsString(responseFalse);
        assertThat(jsonFalse).contains("\"isValid\":false");
    }
}
