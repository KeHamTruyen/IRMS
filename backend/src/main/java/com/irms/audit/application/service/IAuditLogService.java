package com.irms.audit.application.service;

import com.irms.audit.domain.entity.AuditLog;

import java.util.List;

public interface IAuditLogService {

    void logAction(String action, String entityType, Long entityId, String details);

    List<AuditLog> getRecentLogs(int limit);
}
