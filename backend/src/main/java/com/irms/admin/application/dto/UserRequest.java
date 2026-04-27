package com.irms.admin.application.dto;

import com.irms.admin.domain.entity.AuthMethod;
import com.irms.admin.domain.entity.RoleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String fullName;

    private String email;

    private String phone;

    @NotNull
    private RoleType role;

    @NotNull
    private AuthMethod authMethod;

    private Boolean isActive = true;

    private String password;

    private String pin;
}
