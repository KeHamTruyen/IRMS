package com.irms.inventory.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateInventoryQuantityRequest {

    @NotNull
    @Min(0)
    private Integer quantity;
}
