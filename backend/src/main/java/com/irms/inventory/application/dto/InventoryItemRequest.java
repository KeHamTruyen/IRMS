package com.irms.inventory.application.dto;

import com.irms.inventory.domain.entity.InventoryStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryItemRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @NotBlank
    private String unit;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal quantity;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal threshold;

    @NotNull
    private InventoryStatus status;
}
