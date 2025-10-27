package com.fpt.evcare.repository;

import com.fpt.evcare.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    UserEntity findByUserIdAndIsDeletedFalse(UUID id);
    UserEntity findByUserIdAndIsDeletedTrue(UUID id);
    UserEntity findByEmailAndIsDeletedFalse(String email);
    Page<UserEntity> findByIsDeletedFalse(Pageable pageable);
    Page<UserEntity> findBySearchContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByNumberPhone(String numberPhone);

    UserEntity findByUsernameAndIsDeletedFalse(String username);


    UserEntity findByNumberPhoneAndIsDeletedFalse(String phoneNumber);

    UserEntity findByUsernameOrEmailOrNumberPhoneAndIsDeletedFalse(String userInformation, String userInformation1, String userInformation2);
}
