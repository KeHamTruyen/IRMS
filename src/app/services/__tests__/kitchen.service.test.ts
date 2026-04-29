import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

const orderServiceMock = vi.hoisted(() => ({
  orderService: {
    getOrderById: vi.fn(),
  },
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

vi.mock('../order.service', () => orderServiceMock);

import { kitchenService } from '../kitchen.service';

describe('kitchenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('groups kitchen orders into tickets and derives combined status', async () => {
    apiMock.get.mockResolvedValue({
      data: [
        {
          id: 1,
          orderId: 100,
          orderItemId: 201,
          menuItemId: 301,
          itemName: 'Burger',
          quantity: 2,
          specialInstructions: 'No pickles',
          status: 'PENDING',
          assignedChefId: 9,
          priority: 3,
          receivedAt: '2026-04-14T10:00:00Z',
          estimatedPrepTime: 12,
        },
        {
          id: 2,
          orderId: 100,
          orderItemId: 202,
          menuItemId: 302,
          itemName: 'Fries',
          quantity: 1,
          status: 'IN_PROGRESS',
          receivedAt: '2026-04-14T10:00:00Z',
          estimatedPrepTime: 8,
        },
      ],
    });
    orderServiceMock.orderService.getOrderById.mockResolvedValue({
      tableName: 'Table 12',
    });

    const tickets = await kitchenService.getActiveOrders();

    expect(apiMock.get).toHaveBeenCalledWith('/kitchen/orders');
    expect(orderServiceMock.orderService.getOrderById).toHaveBeenCalledWith('100');
    expect(tickets).toHaveLength(1);
    expect(tickets[0]).toMatchObject({
      id: '100',
      orderId: '100',
      tableNumber: 12,
      priority: 'high',
      status: 'preparing',
      estimatedTime: 12,
    });
    expect(tickets[0].items).toHaveLength(2);
  });

  it('calls the correct kitchen action endpoints', async () => {
    await kitchenService.startPreparation('55');
    await kitchenService.markAsReady('55');
    await kitchenService.markAsServed('55');

    expect(apiMock.patch).toHaveBeenNthCalledWith(1, '/kitchen/orders/55/start');
    expect(apiMock.patch).toHaveBeenNthCalledWith(2, '/kitchen/orders/55/ready');
    expect(apiMock.patch).toHaveBeenNthCalledWith(3, '/kitchen/orders/55/served');
  });
});