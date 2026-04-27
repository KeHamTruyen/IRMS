package com.irms.admin.application.dto;

import com.irms.admin.domain.entity.AuthMethod;
import com.irms.admin.domain.entity.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {

    private AuthMethod authMethod;
    private String username;
    private String password;
    private String pin;
    private RoleType role;
}
