package com.irms.inventory.application.dto;

import com.irms.inventory.domain.entity.InventoryStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryItemRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @NotBlank
    private String unit;

    @NotNull
    @Min(0)
    private Integer quantity;

    @NotNull
    @Min(0)
    private Integer threshold;

    @NotNull
    private InventoryStatus status;
}
