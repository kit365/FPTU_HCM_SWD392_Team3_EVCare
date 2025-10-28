package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.user.CreationUserRequest;
import com.fpt.evcare.dto.request.user.RegisterUserRequest;
import com.fpt.evcare.dto.request.user.UpdationUserRequest;
import com.fpt.evcare.dto.response.RegisterUserResponse;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.UserEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target =  "lastLogin", ignore = true)
    UserEntity toEntity (CreationUserRequest creationUserRequest);

    UserEntity toEntity(RegisterUserRequest registerUserRequest);

    @Mapping(target = "roleName", ignore = true)
    UserResponse toResponse (UserEntity userEntity);

    @Mapping(target = "token", ignore = true)
    RegisterUserResponse toRegisterUserResponse(UserEntity userEntity);

    @Mapping(target = "role", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "search", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    // isActive can be updated - DO NOT ignore
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUser(UpdationUserRequest updationUserRequest, @MappingTarget UserEntity userEntity);
}
