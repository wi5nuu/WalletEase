package com.payflow.mapper;

import com.payflow.dto.response.TransactionResponse;
import com.payflow.entity.Transaction;
import com.payflow.entity.Wallet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * MapStruct mapper for Transaction entity and DTOs.
 */
@Mapper(componentModel = "spring")
public interface TransactionMapper {

    TransactionMapper INSTANCE = Mappers.getMapper(TransactionMapper.class);

    @Mapping(source = "senderWallet", target = "sender", qualifiedByName = "mapSender")
    @Mapping(source = "receiverWallet", target = "receiver", qualifiedByName = "mapReceiver")
    @Mapping(source = "type", target = "type")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "referenceCode", target = "referenceCode")
    @Mapping(expression = "java(calculateTotal(transaction))", target = "totalAmount")
    TransactionResponse toResponse(Transaction transaction);

    @Mapping(source = "transaction.senderWallet", target = "sender", qualifiedByName = "mapSender")
    @Mapping(source = "transaction.receiverWallet", target = "receiver", qualifiedByName = "mapReceiver")
    @Mapping(target = "type", expression = "java(transaction.getType().name())")
    @Mapping(target = "status", expression = "java(transaction.getStatus().name())")
    @Mapping(target = "referenceCode", expression = "java(transaction.getReferenceCode())")
    @Mapping(expression = "java(calculateTotal(transaction))", target = "totalAmount")
    @Mapping(target = "direction", expression = "java(determineDirection(transaction, viewerWalletId))")
    TransactionResponse toResponse(Transaction transaction, UUID viewerWalletId);

    @Named("mapSender")
    default TransactionResponse.PartyInfo mapSender(Wallet wallet) {
        if (wallet == null || wallet.getUser() == null) {
            return null;
        }
        return new TransactionResponse.PartyInfo(
                wallet.getId(),
                wallet.getUser().getUsername(),
                wallet.getUser().getFullName()
        );
    }

    @Named("mapReceiver")
    default TransactionResponse.PartyInfo mapReceiver(Wallet wallet) {
        if (wallet == null || wallet.getUser() == null) {
            return null;
        }
        return new TransactionResponse.PartyInfo(
                wallet.getId(),
                wallet.getUser().getUsername(),
                wallet.getUser().getFullName()
        );
    }

    default BigDecimal calculateTotal(Transaction transaction) {
        return transaction.getAmount().add(transaction.getFee());
    }

    default String determineDirection(Transaction transaction, UUID viewerWalletId) {
        if (transaction.getSenderWallet() != null && transaction.getSenderWallet().getId().equals(viewerWalletId)) {
            return "OUT";
        }
        if (transaction.getReceiverWallet() != null && transaction.getReceiverWallet().getId().equals(viewerWalletId)) {
            return "IN";
        }
        return "NEUTRAL";
    }
}
