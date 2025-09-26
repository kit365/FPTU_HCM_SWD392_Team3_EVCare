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
        log.info(RoleConstants.LOG_SUCCESS_CREATE_ROLE, roleEntity.getRoleName());
    }


    @Override
    public RoleEntity getRoleEntity(UUID roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> {
                    log.warn(RoleConstants.LOG_ERR_ROLE_NOT_EXISTED, roleId);
                    return new ResourceNotFoundException(RoleConstants.MESSAGE_ERR_ROLE_NOT_EXISTED);
                });
    }

    @Override
    public RoleEnum getRoleEnum(String roleName) {
        try {
            RoleEnum roleEnum = RoleEnum.valueOf(roleName.toUpperCase());

            if (Set.of(RoleEnum.CUSTOMER, RoleEnum.TECHNICIAN, RoleEnum.ADMIN, RoleEnum.STAFF)
                    .contains(roleEnum)) {
                return roleEnum;
            } else {
                throw new IllegalArgumentException(RoleConstants.MESSAGE_ERR_ROLE_NAME_NOT_EXISTED);
            }

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(RoleConstants.MESSAGE_ERR_ROLE_NAME_NOT_EXISTED);
        }
    }
    @Override
    public void updateRole(UUID roleId, RoleRequest roleRequest) {
        RoleEntity roleEntity = getRoleEntity(roleId);

        getRoleEnum(roleRequest.getRoleName());

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
        roleEntity.setIsDeleted(true);
        roleRepository.save(roleEntity);
        log.info("Soft deleted role with ID: {}", roleEntity.getRoleId());
    }
}
