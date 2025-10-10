package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.service.RedisService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;


@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RedisServiceImpl<T> implements RedisService<T> {
    RedisTemplate<String, Object> redisTemplate; //inject từ file config

    @Override
    public Void clear() {
        return null;
    }

    @Override
    public void save(String key, T value, long ttl, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, ttl, unit);
        if(log.isErrorEnabled()) {
            log.info("Saved key: {} with TTL: {} {}", key, ttl, unit);
        }

    }

    @SuppressWarnings("unchecked")
    @Override
    public T getValue(String key) {
        Object value = redisTemplate.opsForValue().get(key);
        return value != null ? (T) value : null;
    }

    @Override
    public void delete(String key) {
        redisTemplate.delete(key);
    }

    @Override
    public Long getExpire(String key, TimeUnit unit) {
        Long expire = redisTemplate.getExpire(key, unit);
        return expire != null ? expire : -2L; // -2 = không tồn tại, đồng bộ với Redis convention
    }


}
