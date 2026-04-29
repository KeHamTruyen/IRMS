import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

import { orderService } from '../order.service';

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps orders from backend shape to frontend shape', async () => {
    apiMock.get.mockResolvedValue({
      data: [
        {
          id: 21,
          orderNumber: 'ORD-1',
          tableId: 4,
          tableName: 'Table 4',
          serverId: 8,
          serverName: 'Server One',
          status: 'CONFIRMED',
          orderType: 'DINE_IN',
          items: [
            {
              id: 31,
              menuItemId: 55,
              menuItemName: 'Pho',
              quantity: 2,
              unitPrice: 45000,
              subtotal: 90000,
              specialInstructions: 'Less onion',
              status: 'PREPARING',
            },
          ],
          totalAmount: 90000,
          createdAt: '2026-04-14T10:00:00Z',
          updatedAt: '2026-04-14T10:05:00Z',
        },
      ],
    });

    const orders = await orderService.getOrders('confirmed');

    expect(apiMock.get).toHaveBeenCalledWith('/orders', {
      params: { status: 'CONFIRMED' },
    });
    expect(orders[0]).toMatchObject({
      id: '21',
      tableId: '4',
      tableName: 'Table 4',
      serverId: '8',
      serverName: 'Server One',
      status: 'preparing',
      totalAmount: 90000,
    });
    expect(orders[0].items[0]).toMatchObject({
      id: '31',
      quantity: 2,
      notes: 'Less onion',
      status: 'preparing',
    });
  });

  it('creates orders using backend payload shape', async () => {
    apiMock.post.mockResolvedValue({
      data: {
        id: 12,
        orderNumber: 'ORD-2',
        tableId: 7,
        tableName: 'Table 7',
        serverId: 5,
        serverName: 'Server Two',
        status: 'PENDING',
        orderType: 'DELIVERY',
        items: [],
        totalAmount: 0,
        createdAt: '2026-04-14T10:00:00Z',
        updatedAt: '2026-04-14T10:00:00Z',
      },
    });

    await orderService.createOrder('7', [
      { menuItemId: '9', quantity: 2, notes: 'No ice' },
    ], 'DELIVERY', 'Handle with care');

    expect(apiMock.post).toHaveBeenCalledWith('/orders', {
      tableId: 7,
      orderType: 'DELIVERY',
      items: [
        {
          menuItemId: 9,
          quantity: 2,
          specialInstructions: 'No ice',
        },
      ],
      notes: 'Handle with care',
    });
  });

  it('updates order status with uppercase backend value', async () => {
    apiMock.patch.mockResolvedValue({
      data: {
        id: 99,
        orderNumber: 'ORD-99',
        tableId: 1,
        tableName: 'Table 1',
        serverId: 1,
        serverName: 'Server',
        status: 'READY',
        orderType: 'DINE_IN',
        items: [],
        totalAmount: 100,
        createdAt: '2026-04-14T10:00:00Z',
        updatedAt: '2026-04-14T10:00:00Z',
      },
    });

    await orderService.updateOrderStatus('99', 'ready');

    expect(apiMock.patch).toHaveBeenCalledWith('/orders/99/status', null, {
      params: { status: 'READY' },
    });
  });
});