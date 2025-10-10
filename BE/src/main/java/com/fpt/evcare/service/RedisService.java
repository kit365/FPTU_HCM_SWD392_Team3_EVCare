package com.fpt.evcare.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public interface RedisService<T> {
    Void clear();

    //Lưu dữ liệu vào Redis với TTL
    void save(String key, T value, long ttl, TimeUnit unit);

    // Lấy dữ liệu từ Redis
    T getValue(String key);

    // Xóa dữ liệu khỏi Redis
    void delete(String key);

    Long getExpire(String key, TimeUnit unit);


}
