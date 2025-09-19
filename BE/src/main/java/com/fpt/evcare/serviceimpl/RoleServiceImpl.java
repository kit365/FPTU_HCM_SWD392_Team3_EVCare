package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.RoleConstants;
import com.fpt.evcare.dto.request.RoleRequest;
import com.fpt.evcare.dto.response.RoleResponse;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.RoleMapper;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.service.RoleService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService {

    RoleRepository roleRepository;
    RoleMapper roleMapper;

    @Override
    public void createRole(RoleRequest roleRequest) {
        RoleEntity roleEntity = roleMapper.toEntity(roleRequest);
        roleRepository.save(roleEntity);
        log.info("Role created with ID: {}", roleEntity.getId());
    }
    private RoleEntity getRoleEntity(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RoleConstants.ERR_ROLE_NOT_EXISTED));
    }

    @Override
    public void updateRole(UUID id, RoleRequest roleRequest) {
        RoleEntity roleEntity = getRoleEntity(id);
        roleMapper.updateRole(roleEntity, roleRequest);
        roleRepository.save(roleEntity);
        log.info("Role updated with ID: {}", roleEntity.getId());
    }

    @Override
    public RoleResponse getRoleByIdResponse(UUID id) {
        return roleMapper.toResponse(getRoleEntity(id));
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        List<RoleEntity> all = roleRepository.findAll();
        return roleMapper.toResponseList(all);
    }
    @Override
    public void deleteRole(UUID id) {
        RoleEntity roleEntity = getRoleEntity(id);
        roleRepository.delete(roleEntity);
        log.info("Role deleted with ID: {}", roleEntity.getId());
    }
    @Override
    public void deleteSoftRole(UUID id) {
        RoleEntity roleEntity = getRoleEntity(id);
        roleEntity.setIsDeleted(true); // đánh dấu đã xóa
        roleRepository.save(roleEntity);
        log.info("Soft deleted role with ID: {}", roleEntity.getId());
    }

}
