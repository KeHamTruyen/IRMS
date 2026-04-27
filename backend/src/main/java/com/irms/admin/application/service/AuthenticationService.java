package com.irms.admin.application.service;

import com.irms.admin.application.dto.AuthRequest;
import com.irms.admin.application.dto.AuthResponse;
import com.irms.admin.domain.entity.AuthMethod;
import com.irms.admin.domain.entity.RoleType;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.common.exception.BusinessException;
import com.irms.admin.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        AuthMethod authMethod = request.getAuthMethod();
        if (authMethod == null) {
            throw new BusinessException("Authentication method is required");
        }

        User user = switch (authMethod) {
            case PASSWORD -> authenticateWithPassword(request);
            case PIN -> authenticateWithPin(request);
        };

        user.updateLastLogin();
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .authMethod(user.getAuthMethod())
                .build();
    }

    private User authenticateWithPassword(AuthRequest request) {
        if (isBlank(request.getUsername()) || isBlank(request.getPassword())) {
            throw new BusinessException("Username and password are required");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getAuthMethod() != AuthMethod.PASSWORD) {
            throw new BadCredentialsException("This account does not support password login");
        }

        return user;
    }

    private User authenticateWithPin(AuthRequest request) {
        if (request.getRole() == null || isBlank(request.getPin())) {
            throw new BusinessException("Role and PIN are required");
        }

        List<User> candidates = userRepository.findByRoleAndAuthMethodAndIsActive(
                request.getRole(),
                AuthMethod.PIN,
                true
        );

        return candidates.stream()
                .filter(user -> user.getPinHash() != null && passwordEncoder.matches(request.getPin(), user.getPinHash()))
                .findFirst()
                .orElseThrow(() -> new BadCredentialsException("Invalid role or PIN"));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
