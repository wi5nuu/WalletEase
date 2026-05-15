package com.payflow.mapper;

import com.payflow.dto.response.NotificationResponse;
import com.payflow.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * MapStruct mapper for Notification entity and DTOs.
 */
@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationMapper INSTANCE = Mappers.getMapper(NotificationMapper.class);

    @Mapping(source = "type", target = "type")
    @Mapping(source = "isRead", target = "isRead")
    NotificationResponse toResponse(Notification entity);
}
