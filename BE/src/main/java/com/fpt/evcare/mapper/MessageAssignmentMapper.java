package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.response.MessageAssignmentResponse;
import com.fpt.evcare.entity.MessageAssignmentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public abstract class MessageAssignmentMapper {
    
    @Mapping(target = "customerId", source = "customer.userId")
    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "customerEmail", source = "customer.email")
    @Mapping(target = "customerAvatarUrl", source = "customer.avatarUrl")
    @Mapping(target = "customerIsActive", source = "customer.isActive")
    @Mapping(target = "assignedStaffId", source = "assignedStaff.userId")
    @Mapping(target = "assignedStaffName", source = "assignedStaff.fullName")
    @Mapping(target = "assignedStaffEmail", source = "assignedStaff.email")
    @Mapping(target = "assignedStaffAvatarUrl", source = "assignedStaff.avatarUrl")
    @Mapping(target = "assignedStaffIsActive", source = "assignedStaff.isActive")
    @Mapping(target = "assignedByName", source = "assignedBy.fullName")
    @Mapping(target = "unreadMessageCount", ignore = true)
    @Mapping(target = "lastMessageAt", ignore = true)
    public abstract MessageAssignmentResponse toResponse(MessageAssignmentEntity entity);
}

