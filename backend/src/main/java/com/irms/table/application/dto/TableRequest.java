package com.irms.table.application.dto;

import com.irms.table.domain.entity.TableStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TableRequest {

    @NotBlank
    private String tableNumber;

    @NotNull
    @Min(1)
    private Integer capacity;

    @NotNull
    private TableStatus status;

    private String location;
}
