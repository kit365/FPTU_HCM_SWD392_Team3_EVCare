package com.fpt.evcare.repository;

import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.enums.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {
    RoleEntity findRoleByRoleId(UUID roleId);
    List<RoleEntity> findAllByIsDeletedFalse();
    RoleEntity findByRoleName(RoleEnum roleEnum);
}
