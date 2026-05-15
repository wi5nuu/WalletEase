package com.payflow.mapper;

import com.payflow.dto.response.UserResponse;
import com.payflow.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * MapStruct mapper for User entity and DTOs.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(source = "role", target = "role")
    @Mapping(source = "isActive", target = "isActive")
    @Mapping(expression = "java(entity.hasTransactionPin())", target = "hasPin")
    UserResponse toResponse(User entity);
}
