// Analytics Service
import api from './api';
import { DashboardStats } from '../types';

// Backend DTO
interface DashboardStatsResponse {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  todayRevenue: number;
  occupiedTables: number;
  availableTables: number;
  pendingKitchenOrders: number;
  readyToServeOrders: number;
}

// Map backend stats to frontend
const mapDashboardStats = (backendStats: DashboardStatsResponse): DashboardStats => {
  return {
    todayRevenue: backendStats.todayRevenue,
    todayOrders: backendStats.totalOrders,
    activeTable: backendStats.occupiedTables,
    pendingReservations: 0, // Not in backend yet
    lowStockItems: 0, // Not in backend yet
  };
};

export const analyticsService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStatsResponse>('/analytics/dashboard');
    const data = (response as any).data || response;
    return mapDashboardStats(data);
  },
};
