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
public class AuthResponse {
    
    private String token;
    private String username;
    private String fullName;
    private RoleType role;
    private AuthMethod authMethod;
    private Long userId;
}
