package com.fpt.evcare.service;

import com.fpt.evcare.serviceimpl.RedisServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import java.util.concurrent.TimeUnit;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RedisServiceTest {
    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private RedisServiceImpl<String> redisService;

    @BeforeEach
    void setUp() {
        // Mock redisTemplate.opsForValue() để trả về valueOperations
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }



    @Test
    void testSaveWithNullKey() {
        // Arrange
        String value = "testValue";
        long ttl = 60L;
        TimeUnit unit = TimeUnit.SECONDS;

        // Act
        redisService.save(null, value, ttl, unit);

        // Assert
        verify(valueOperations).set(eq(null), eq(value), eq(ttl), eq(unit));
    }

    @Test
    void testGetValueWithExistingKey() {
        // Arrange
        String key = "testKey";
        String expectedValue = "testValue";
        when(valueOperations.get(key)).thenReturn(expectedValue);

        // Act
        String result = redisService.getValue(key);

        // Assert
        assertThat(result).isEqualTo(expectedValue);
        verify(valueOperations).get(eq(key));
    }

    @Test
    void testGetValueWithNonExistingKey() {
        // Arrange
        String key = "nonExistingKey";
        when(valueOperations.get(key)).thenReturn(null);

        // Act
        String result = redisService.getValue(key);

        // Assert
        assertThat(result).isNull();
        verify(valueOperations).get(eq(key));
    }

}