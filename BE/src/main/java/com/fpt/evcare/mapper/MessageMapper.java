package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.request.message.CreationMessageRequest;
import com.fpt.evcare.dto.request.message.UpdationMessageRequest;
import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.entity.MessageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MessageMapper {

    @Mapping(target = "senderId", source = "sender.userId")
    @Mapping(target = "senderName", source = "sender.fullName")
    @Mapping(target = "receiverId", source = "receiver.userId")
    @Mapping(target = "receiverName", source = "receiver.fullName")
    MessageResponse toResponse(MessageEntity entity);

    @Mapping(target = "messageId", ignore = true)
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "receiver", ignore = true)
    @Mapping(target = "isRead", ignore = true)
    @Mapping(target = "sentAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    MessageEntity toEntity(CreationMessageRequest request);

    @Mapping(target = "messageId", ignore = true)
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "receiver", ignore = true)
    @Mapping(target = "isRead", ignore = true)
    @Mapping(target = "sentAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(@MappingTarget MessageEntity entity, UpdationMessageRequest request);
}


