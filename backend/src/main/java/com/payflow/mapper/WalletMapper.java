package com.payflow.mapper;

import com.payflow.dto.response.WalletResponse;
import com.payflow.entity.Wallet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

/**
 * MapStruct mapper for Wallet entity and DTOs.
 */
@Mapper(componentModel = "spring")
public interface WalletMapper {

    WalletMapper INSTANCE = Mappers.getMapper(WalletMapper.class);

    @Mapping(source = "user.id", target = "userId")
    WalletResponse toResponse(Wallet entity);
}
