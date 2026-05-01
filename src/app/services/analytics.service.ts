// Analytics Service
import api from './api';
import { DashboardStats } from '../types';

interface BestSellingItemResponse {
  menuItemId: number;
  itemName: string;
  totalQuantity: number;
}

export interface SalesReportResponse {
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  peakHour: string;
  bestSellingItems: BestSellingItemResponse[];
}

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
  pendingReservations: number;
  lowStockItems: number;
}

// Map backend stats to frontend
const mapDashboardStats = (backendStats: DashboardStatsResponse): DashboardStats => {
  return {
    todayRevenue: backendStats.todayRevenue,
    todayOrders: backendStats.totalOrders,
    activeTable: backendStats.occupiedTables,
    pendingReservations: backendStats.pendingReservations,
    lowStockItems: backendStats.lowStockItems,
  };
};

export const analyticsService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStatsResponse>('/analytics/dashboard');
    const data = (response as any).data || response;
    return mapDashboardStats(data);
  },

  async getSalesReport(startDate?: string, endDate?: string): Promise<SalesReportResponse> {
    const response = await api.get<SalesReportResponse>('/analytics/sales', {
      params: { startDate, endDate },
    });
    return ((response as any).data || response) as SalesReportResponse;
  },

  async downloadSalesReportCsv(startDate?: string, endDate?: string): Promise<Blob> {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);

    const response = await fetch(`/api/analytics/sales/export${query.toString() ? `?${query.toString()}` : ''}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export sales report');
    }

    return response.blob();
  },
};
