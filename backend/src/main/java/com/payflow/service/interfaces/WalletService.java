package com.payflow.service.interfaces;

import com.payflow.dto.response.WalletResponse;
import com.payflow.entity.Wallet;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * WalletService interface - ABSTRACTION for wallet operations.
 */
public interface WalletService extends BaseService<Wallet, UUID> {

    Optional<Wallet> findByUserId(UUID userId);

    Wallet createWallet(UUID userId);

    WalletResponse getWalletByUserId(UUID userId);

    BigDecimal getBalance(UUID userId);

    String generateQrCode(UUID userId);

    WalletResponse getWalletByQrCode(String qrData);
}
