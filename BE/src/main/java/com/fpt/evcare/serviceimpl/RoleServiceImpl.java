package com.fpt.evcare.serviceimpl;

import com.fpt.evcare.constants.RoleConstants;
import com.fpt.evcare.dto.request.RoleRequest;
import com.fpt.evcare.dto.response.RoleResponse;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.enums.RoleEnum;
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
import java.util.Set;
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
        log.info("Role created with ID: {}", roleEntity.getRoleId());
    }
    private RoleEntity getRoleEntity(UUID roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException(RoleConstants.ERR_ROLE_NOT_EXISTED));
    }

    @Override
    public void updateRole(UUID roleId, RoleRequest roleRequest) {
        RoleEntity roleEntity = roleRepository.findRoleByRoleId(roleId);
        if (roleEntity == null) {
            log.error(RoleConstants.ERR_ROLE_NOT_EXISTED);
            throw new ResourceNotFoundException(RoleConstants.ERR_ROLE_NOT_EXISTED);
        }
        try {
            RoleEnum roleEnum = RoleEnum.valueOf(roleRequest.getRoleName());

            Set<RoleEnum> allowed = Set.of(RoleEnum.CUSTOMER, RoleEnum.TECHNICIAN, RoleEnum.ADMIN, RoleEnum.STAFF);

            if (!allowed.contains(roleEnum)) {
                throw new IllegalArgumentException(RoleConstants.ERR_ROLE_NAME_NOT_EXISTED);
            }

        } catch (IllegalArgumentException e) {
            // xử lý khi roleName không đúng enum
            throw new IllegalArgumentException(RoleConstants.ERR_ROLE_NAME_NOT_EXISTED);
        }
        roleMapper.updateRole(roleEntity, roleRequest);
        roleRepository.save(roleEntity);
        log.info("Role updated with ID: {}", roleEntity.getRoleId());
    }

    @Override
    public RoleResponse getRoleByIdResponse(UUID roleId) {
        return roleMapper.toResponse(getRoleEntity(roleId));
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        List<RoleEntity> all = roleRepository.findAllByIsDeletedFalse();
        return roleMapper.toResponseList(all);
    }
    @Override
    public void deleteRole(UUID roleId) {
        RoleEntity roleEntity = getRoleEntity(roleId);
        roleRepository.delete(roleEntity);
        log.info("Role deleted with ID: {}", roleEntity.getRoleId());
    }
    @Override
    public void deleteSoftRole(UUID roleId) {
        RoleEntity roleEntity = getRoleEntity(roleId);
        roleEntity.setIsDeleted(true); // đánh dấu đã xóa
        roleRepository.save(roleEntity);
        log.info("Soft deleted role with ID: {}", roleEntity.getRoleId());
    }

}
