package com.fpt.evcare.repository;

import com.fpt.evcare.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    UserEntity findByUserId(UUID id);
    UserEntity findByEmail(String email);
    List<UserEntity> findAll();
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    boolean existsByNumberPhone(String numberPhone);
}
