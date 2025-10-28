package com.fpt.evcare.repository;

import com.fpt.evcare.entity.UserEntity;
import io.lettuce.core.dynamic.annotation.Param;
import com.fpt.evcare.enums.RoleEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
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

    @Query("""
        SELECT u
        FROM UserEntity u
        WHERE u.role.roleName = 'TECHNICIAN'
          AND u.isDeleted = false
          AND u.isActive = true
        ORDER BY u.fullName
    """)
    java.util.List<UserEntity> findTechnicians();

    // Search users by role
    @Query("SELECT u FROM UserEntity u WHERE u.role.roleName = :roleName AND u.isDeleted = false")
    List<UserEntity> findByRoleNameAndIsDeletedFalse(@Param("roleName") RoleEnum roleName);
}
