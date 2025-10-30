package com.fpt.evcare.mapper;

import com.fpt.evcare.dto.response.MessageResponse;
import com.fpt.evcare.entity.MessageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    
    @Mapping(target = "senderId", source = "sender.userId")
    @Mapping(target = "senderName", source = "sender.fullName")
    @Mapping(target = "senderAvatarUrl", source = "sender.avatarUrl")
    @Mapping(target = "receiverId", source = "receiver.userId")
    @Mapping(target = "receiverName", source = "receiver.fullName")
    @Mapping(target = "receiverAvatarUrl", source = "receiver.avatarUrl")
    MessageResponse toResponse(MessageEntity entity);
}

