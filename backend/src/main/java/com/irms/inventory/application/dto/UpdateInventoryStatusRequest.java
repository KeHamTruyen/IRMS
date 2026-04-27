package com.irms.inventory.application.dto;

import com.irms.inventory.domain.entity.InventoryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateInventoryStatusRequest {

    @NotNull
    private InventoryStatus status;
}
