package com.fpt.evcare.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@DisplayName("RedisConfig Test")
class RedisConfigTest {

    @InjectMocks
    private RedisConfig redisConfig = new RedisConfig();

    @Test
    @DisplayName("redisTemplate should configure with connectionFactory when provided")
    void redisTemplate_WithConnectionFactory() {
        // Arrange
        RedisConnectionFactory connectionFactory = mock(RedisConnectionFactory.class);
        ObjectMapper objectMapper = new ObjectMapper();

        // Act
        RedisTemplate<String, Object> template =
                redisConfig.redisTemplate(connectionFactory, objectMapper);

        // Assert
        assertThat(template).isNotNull();
        assertThat(template.getConnectionFactory()).isEqualTo(connectionFactory);
        assertThat(template.getKeySerializer()).isNotNull();
        assertThat(template.getValueSerializer()).isNotNull();
        assertThat(template.getHashKeySerializer()).isNotNull();
        assertThat(template.getHashValueSerializer()).isNotNull();
    }

    @Test
    @DisplayName("redisTemplate should still configure without connectionFactory")
    void redisTemplate_WithoutConnectionFactory() {
        // Arrange
        ObjectMapper objectMapper = new ObjectMapper();

        // Act
        RedisTemplate<String, Object> template =
                redisConfig.redisTemplate(null, objectMapper);

        // Assert
        assertThat(template).isNotNull();
        assertThat(template.getConnectionFactory()).isNull(); // vì không set connectionFactory
        assertThat(template.getKeySerializer()).isNotNull();
        assertThat(template.getValueSerializer()).isNotNull();
        assertThat(template.getHashKeySerializer()).isNotNull();
        assertThat(template.getHashValueSerializer()).isNotNull();
    }
}
