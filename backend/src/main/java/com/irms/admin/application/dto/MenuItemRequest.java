package com.irms.admin.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MenuItemRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String category;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal price;

    private String description;

    private Boolean isAvailable = true;

    @Min(0)
    private Integer preparationTime;

    private String imageUrl;
}
