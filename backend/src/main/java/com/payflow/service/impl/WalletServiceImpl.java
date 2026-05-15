package com.payflow.service.impl;

import com.payflow.dto.response.WalletResponse;
import com.payflow.entity.User;
import com.payflow.entity.Wallet;
import com.payflow.exception.ResourceNotFoundException;
import com.payflow.exception.UnauthorizedAccessException;
import com.payflow.mapper.WalletMapper;
import com.payflow.repository.UserRepository;
import com.payflow.repository.WalletRepository;
import com.payflow.service.interfaces.WalletService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * WalletServiceImpl - Concrete implementation of WalletService.
 * 
 * ABSTRACTION: Implements WalletService interface.
 * ENCAPSULATION: Balance access only through domain methods.
 */
@Service
@Transactional(readOnly = true)
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final WalletMapper walletMapper;

    public WalletServiceImpl(WalletRepository walletRepository, 
                             UserRepository userRepository,
                             WalletMapper walletMapper) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.walletMapper = walletMapper;
    }

    @Override
    public Optional<Wallet> findById(UUID id) {
        return walletRepository.findById(id);
    }

    @Override
    public List<Wallet> findAll() {
        return walletRepository.findAll();
    }

    @Override
    @Transactional
    public Wallet save(Wallet wallet) {
        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        walletRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return walletRepository.existsById(id);
    }

    @Override
    public long count() {
        return walletRepository.count();
    }

    @Override
    public Optional<Wallet> findByUserId(UUID userId) {
        return walletRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public Wallet createWallet(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        if (walletRepository.existsByUserId(userId)) {
            throw new IllegalStateException("User already has a wallet");
        }
        
        Wallet wallet = Wallet.createWallet(user);
        return walletRepository.save(wallet);
    }

    @Override
    @PreAuthorize("#userId == authentication.principal.username or hasRole('ADMIN')")
    public WalletResponse getWalletByUserId(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));
        return walletMapper.toResponse(wallet);
    }

    @Override
    @Cacheable(value = "walletBalances", key = "#userId")
    @PreAuthorize("#userId == authentication.principal.username or hasRole('ADMIN')")
    public BigDecimal getBalance(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));
        return wallet.getBalance();
    }

    @Override
    @PreAuthorize("#userId == authentication.principal.username")
    public String generateQrCode(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));
        // QR code encodes wallet ID
        return wallet.getId().toString();
    }

    @Override
    public WalletResponse getWalletByQrCode(String qrData) {
        try {
            UUID walletId = UUID.fromString(qrData);
            Wallet wallet = walletRepository.findById(walletId)
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", walletId));
            return walletMapper.toResponse(wallet);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Wallet", "qrData", qrData);
        }
    }
}
