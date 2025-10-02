package com.fpt.evcare.service;

import com.fpt.evcare.constants.RoleConstants;
import com.fpt.evcare.dto.request.RoleRequest;
import com.fpt.evcare.dto.response.RoleResponse;
import com.fpt.evcare.entity.RoleEntity;
import com.fpt.evcare.enums.RoleEnum;
import com.fpt.evcare.exception.ResourceNotFoundException;
import com.fpt.evcare.mapper.RoleMapper;
import com.fpt.evcare.repository.RoleRepository;
import com.fpt.evcare.serviceimpl.RoleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoleServiceTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RoleMapper roleMapper;

    @InjectMocks
    private RoleServiceImpl roleService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // Test createRole
    @Test
    void testCreateRole_ShouldSaveRole() {
        RoleRequest request = new RoleRequest();
        request.setRoleName("CUSTOMER");

        RoleEntity entity = new RoleEntity();
        entity.setRoleName(RoleEnum.CUSTOMER);

        when(roleMapper.toEntity(request)).thenReturn(entity);

        roleService.createRole(request);

        verify(roleRepository, times(1)).save(entity);
    }

    // Test getRoleEntity khi tồn tại
    @Test
    void testGetRoleEntity_WhenExists_ShouldReturnRole() {
        UUID roleId = UUID.randomUUID();
        RoleEntity entity = new RoleEntity();
        entity.setRoleId(roleId);

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(entity));

        RoleEntity result = roleService.getRoleEntity(roleId);

        assertEquals(roleId, result.getRoleId());
    }

    // Test getRoleEntity khi không tồn tại
    @Test
    void testGetRoleEntity_WhenNotExists_ShouldThrowException() {
        UUID roleId = UUID.randomUUID();
        when(roleRepository.findById(roleId)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> roleService.getRoleEntity(roleId));

        assertEquals(RoleConstants.MESSAGE_ERR_ROLE_NOT_EXISTED, exception.getMessage());
    }

    // Test getRoleEnum với role hợp lệ
    @Test
    void testGetRoleEnum_ValidRole_ShouldReturnEnum() {
        RoleEnum roleEnum = roleService.getRoleEnum("customer");
        assertEquals(RoleEnum.CUSTOMER, roleEnum);
    }

    // Test getRoleEnum với role không hợp lệ
    @Test
    void testGetRoleEnum_InvalidRole_ShouldThrowException() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> roleService.getRoleEnum("invalidRole"));

        assertEquals(RoleConstants.MESSAGE_ERR_ROLE_NAME_NOT_EXISTED, exception.getMessage());
    }

    // Test updateRole
    @Test
    void testUpdateRole_ShouldUpdateAndSave() {
        UUID roleId = UUID.randomUUID();
        RoleEntity entity = new RoleEntity();
        entity.setRoleId(roleId);

        RoleRequest request = new RoleRequest();
        request.setRoleName("ADMIN");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(entity));
        doNothing().when(roleMapper).updateRole(entity, request);

        roleService.updateRole(roleId, request);

        verify(roleMapper, times(1)).updateRole(entity, request);
        verify(roleRepository, times(1)).save(entity);
    }

    // Test deleteRole (soft delete)
    @Test
    void testDeleteRole_ShouldSetIsDeletedTrue() {
        UUID roleId = UUID.randomUUID();
        RoleEntity entity = new RoleEntity();
        entity.setRoleId(roleId);
        entity.setIsDeleted(false);

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(entity));

        roleService.deleteRole(roleId);

        assertTrue(entity.getIsDeleted());
        verify(roleRepository, times(1)).save(entity);
    }

    // Test getAllRoles
    @Test
    void testGetAllRoles_ShouldReturnMappedResponses() {
        RoleEntity entity1 = new RoleEntity();
        RoleEntity entity2 = new RoleEntity();

        List<RoleEntity> entities = List.of(entity1, entity2);
        when(roleRepository.findAllByIsDeletedFalse()).thenReturn(entities);

        List<RoleResponse> responses = new ArrayList<>();
        when(roleMapper.toResponseList(entities)).thenReturn(responses);

        List<RoleResponse> result = roleService.getAllRoles();

        assertEquals(responses, result);
    }

    // Test getRoleByIdResponse
    @Test
    void testGetRoleByIdResponse_ShouldReturnMappedResponse() {
        UUID roleId = UUID.randomUUID();
        RoleEntity entity = new RoleEntity();
        entity.setRoleId(roleId);

        RoleResponse response = new RoleResponse();

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(entity));
        when(roleMapper.toResponse(entity)).thenReturn(response);

        RoleResponse result = roleService.getRoleByIdResponse(roleId);

        assertEquals(response, result);
    }
}
