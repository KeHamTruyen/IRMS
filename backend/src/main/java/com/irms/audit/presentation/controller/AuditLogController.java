package com.irms.audit.presentation.controller;

import com.irms.audit.domain.entity.AuditLog;
import com.irms.audit.domain.repository.AuditLogRepository;
import com.irms.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentLogs(
            @RequestParam(defaultValue = "100") int limit) {
        List<AuditLog> logs = auditLogRepository.findTop100ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success(logs.stream().limit(Math.max(1, limit)).toList()));
    }
}
