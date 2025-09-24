package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.UserRequest;
import com.fpt.evcare.dto.response.UserResponse;
import com.fpt.evcare.entity.UserEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    UserEntity toEntity (UserRequest userRequest);

    @Mapping(target = "roleName", ignore = true)
    UserResponse toResponse (UserEntity userEntity);

    @Mapping(target = "roles", ignore = true)
    List<UserResponse> toResponses (List<UserEntity> userEntities);

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "email", ignore = true)
    void updateUser(UserRequest userRequest, @MappingTarget UserEntity userEntity);
}
