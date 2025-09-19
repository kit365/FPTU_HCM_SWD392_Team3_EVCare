package com.fpt.evcare.repository;

import com.fpt.evcare.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {
    RoleEntity findRoleById(UUID id);

    Optional<RoleEntity> findById(UUID id);

    boolean existsById(UUID id);



}
