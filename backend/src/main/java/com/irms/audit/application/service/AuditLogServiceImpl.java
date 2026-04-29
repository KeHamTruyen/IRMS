package com.irms.audit.application.service;

import com.irms.audit.domain.entity.AuditLog;
import com.irms.audit.domain.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements IAuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void logAction(String action, String entityType, Long entityId, String details) {
        String username = "system";
        if (SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().getName() != null) {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        }

        AuditLog log = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .username(username)
                .details(details)
                .build();

        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit));
    }
}
