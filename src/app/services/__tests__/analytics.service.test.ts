import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

import { analyticsService } from '../analytics.service';

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps dashboard stats to the frontend shape', async () => {
    apiMock.get.mockResolvedValue({
      data: {
        totalOrders: 120,
        activeOrders: 14,
        completedOrders: 99,
        todayRevenue: 1500000,
        occupiedTables: 8,
        availableTables: 4,
        pendingKitchenOrders: 5,
        readyToServeOrders: 7,
        pendingReservations: 3,
        lowStockItems: 2,
      },
    });

    const stats = await analyticsService.getDashboardStats();

    expect(apiMock.get).toHaveBeenCalledWith('/analytics/dashboard');
    expect(stats).toEqual({
      todayRevenue: 1500000,
      todayOrders: 120,
      activeTable: 8,
      pendingReservations: 3,
      lowStockItems: 2,
    });
  });
});