package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.employee_profile.CreationEmployeeProfileRequest;
import com.fpt.evcare.dto.request.employee_profile.UpdationEmployeeProfileRequest;
import com.fpt.evcare.dto.response.EmployeeProfileResponse;
import com.fpt.evcare.entity.EmployeeProfileEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface EmployeeProfileMapper {
    @Mapping(target = "user", ignore = true)
    EmployeeProfileEntity toEmployeeProfile(CreationEmployeeProfileRequest e);

    EmployeeProfileResponse toEmployeeProfileResponse(EmployeeProfileEntity e);

    void updateEmployeeProfileFromDto(UpdationEmployeeProfileRequest request, @MappingTarget EmployeeProfileEntity entity);
}
