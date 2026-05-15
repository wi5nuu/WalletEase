package com.payflow.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for bill information responses.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BillResponse {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("category")
    private String category;

    @JsonProperty("iconCode")
    private String iconCode;

    @JsonProperty("fixedAmount")
    private BigDecimal fixedAmount;

    @JsonProperty("isVariableAmount")
    private Boolean isVariableAmount;

    @JsonProperty("isActive")
    private Boolean isActive;

    public BillResponse() {
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getIconCode() {
        return iconCode;
    }

    public void setIconCode(String iconCode) {
        this.iconCode = iconCode;
    }

    public BigDecimal getFixedAmount() {
        return fixedAmount;
    }

    public void setFixedAmount(BigDecimal fixedAmount) {
        this.fixedAmount = fixedAmount;
    }

    public Boolean getIsVariableAmount() {
        return isVariableAmount;
    }

    public void setIsVariableAmount(Boolean isVariableAmount) {
        this.isVariableAmount = isVariableAmount;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
