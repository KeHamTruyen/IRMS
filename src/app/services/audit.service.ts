import api from './api';

export interface AuditLogEntry {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  username?: string;
  details?: string;
  createdAt: string;
}

export const auditService = {
  async getRecentLogs(limit = 100): Promise<AuditLogEntry[]> {
    const response = await api.get<AuditLogEntry[]>('/audit-logs', { params: { limit } });
    const data = (response as any).data || response;
    return Array.isArray(data) ? data : [];
  },
};
