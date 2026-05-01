package com.irms.audit.application.service;

public interface IAuditLogService {

    void logAction(String action, String entityType, Long entityId, String details);
}
