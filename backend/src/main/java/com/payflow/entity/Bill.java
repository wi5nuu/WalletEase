package com.payflow.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * Bill entity representing bill types and providers.
 * 
 * INHERITANCE: Extends BaseEntity for common audit fields.
 */
@Entity
@Table(name = "bills")
public class Bill extends BaseEntity {

    public enum Category {
        ELECTRICITY,
        WATER,
        INTERNET,
        TV,
        MOBILE,
        INSURANCE,
        STREAMING,
        MUSIC,
        OTHER
    }

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "category", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "icon_code", length = 50)
    private String iconCode;

    // Fixed amount means the bill has a fixed price (e.g., subscriptions)
    // Null means variable amount (e.g., utilities)
    @Column(name = "fixed_amount", precision = 18, scale = 2)
    private BigDecimal fixedAmount;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Default constructor
    protected Bill() {
    }

    // Factory method
    public static Bill create(String name, Category category, String iconCode, BigDecimal fixedAmount) {
        Bill bill = new Bill();
        bill.name = name;
        bill.category = category;
        bill.iconCode = iconCode;
        bill.fixedAmount = fixedAmount;
        bill.isActive = true;
        return bill;
    }

    // Getters
    public String getName() {
        return name;
    }

    public Category getCategory() {
        return category;
    }

    public String getIconCode() {
        return iconCode;
    }

    public BigDecimal getFixedAmount() {
        return fixedAmount;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setIconCode(String iconCode) {
        this.iconCode = iconCode;
    }

    public void setFixedAmount(BigDecimal fixedAmount) {
        this.fixedAmount = fixedAmount;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // Helper methods
    public boolean hasFixedAmount() {
        return fixedAmount != null;
    }

    public boolean isVariableAmount() {
        return fixedAmount == null;
    }
}
