package com.payflow.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.payflow.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for transaction information responses.
 */
public class TransactionResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("amount")
    private BigDecimal amount;

    @JsonProperty("fee")
    private BigDecimal fee;

    @JsonProperty("totalAmount")
    private BigDecimal totalAmount;

    @JsonProperty("type")
    private String type;

    @JsonProperty("status")
    private String status;

    @JsonProperty("referenceCode")
    private String referenceCode;

    @JsonProperty("description")
    private String description;

    @JsonProperty("sender")
    private PartyInfo sender;

    @JsonProperty("receiver")
    private PartyInfo receiver;

    @JsonProperty("direction")
    private String direction; // "IN", "OUT", "NEUTRAL"

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    // Nested class for party information
    public static class PartyInfo {
        @JsonProperty("walletId")
        private UUID walletId;

        @JsonProperty("username")
        private String username;

        @JsonProperty("fullName")
        private String fullName;

        public PartyInfo() {
        }

        public PartyInfo(UUID walletId, String username, String fullName) {
            this.walletId = walletId;
            this.username = username;
            this.fullName = fullName;
        }

        // Getters and Setters
        public UUID getWalletId() {
            return walletId;
        }

        public void setWalletId(UUID walletId) {
            this.walletId = walletId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }

    public TransactionResponse() {
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public void setFee(BigDecimal fee) {
        this.fee = fee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PartyInfo getSender() {
        return sender;
    }

    public void setSender(PartyInfo sender) {
        this.sender = sender;
    }

    public PartyInfo getReceiver() {
        return receiver;
    }

    public void setReceiver(PartyInfo receiver) {
        this.receiver = receiver;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
