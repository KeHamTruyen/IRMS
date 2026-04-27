package com.irms.admin.presentation.controller;

import com.irms.admin.application.dto.UserRequest;
import com.irms.admin.domain.entity.AuthMethod;
import com.irms.admin.domain.entity.RoleType;
import com.irms.admin.domain.entity.User;
import com.irms.admin.domain.repository.UserRepository;
import com.irms.common.dto.ApiResponse;
import com.irms.common.exception.BusinessException;
import com.irms.common.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
public class UserController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(
            @RequestParam(required = false) RoleType role) {
        
        List<User> users = role != null 
                ? userRepository.findByRole(role)
                : userRepository.findAll();
        
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user")
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody UserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException("Tên đăng nhập đã tồn tại");
        }

        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(request.getRole())
                .authMethod(request.getAuthMethod())
                .isActive(Boolean.TRUE.equals(request.getIsActive()))
                .passwordHash(resolvePasswordHash(request))
                .pinHash(resolvePinHash(request))
                .build();

        User created = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(created, "Tạo nhân sự thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        userRepository.findByUsername(request.getUsername())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessException("Tên đăng nhập đã tồn tại");
                });

        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setAuthMethod(request.getAuthMethod());
        user.setIsActive(Boolean.TRUE.equals(request.getIsActive()));

        if (request.getAuthMethod() == AuthMethod.PASSWORD && !isBlank(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setPinHash(null);
        }

        if (request.getAuthMethod() == AuthMethod.PIN && !isBlank(request.getPin())) {
            user.setPinHash(passwordEncoder.encode(request.getPin()));
            user.setPasswordHash(null);
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật nhân sự thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", id);
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa nhân sự thành công"));
    }
    
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate user")
    public ResponseEntity<ApiResponse<User>> activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        user.activate();
        User updated = userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success(updated, "User activated"));
    }
    
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate user")
    public ResponseEntity<ApiResponse<User>> deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        user.deactivate();
        User updated = userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success(updated, "User deactivated"));
    }

    private String resolvePasswordHash(UserRequest request) {
        if (request.getAuthMethod() != AuthMethod.PASSWORD) {
            return null;
        }

        return passwordEncoder.encode(isBlank(request.getPassword()) ? "password123" : request.getPassword());
    }

    private String resolvePinHash(UserRequest request) {
        if (request.getAuthMethod() != AuthMethod.PIN) {
            return null;
        }

        return passwordEncoder.encode(isBlank(request.getPin()) ? "1234" : request.getPin());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
