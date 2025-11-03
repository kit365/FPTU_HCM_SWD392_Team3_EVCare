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
    @Mapping(target = "certifications", ignore = true)
    EmployeeProfileEntity toEmployeeProfile(CreationEmployeeProfileRequest e);

    @Mapping(target = "certifications", ignore = true)
    EmployeeProfileResponse toEmployeeProfileResponse(EmployeeProfileEntity e);

    @Mapping(target = "certifications", ignore = true)
    void updateEmployeeProfileFromDto(UpdationEmployeeProfileRequest request, @MappingTarget EmployeeProfileEntity entity);
}
