import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

import { inventoryService } from '../inventory.service';

describe('inventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps inventory responses into frontend inventory items', async () => {
    apiMock.get.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Tomatoes',
          category: 'Vegetables',
          quantity: 25,
          unit: 'kg',
          minStock: 10,
          lastRestocked: '2026-04-13T10:00:00Z',
        },
      ],
    });

    const items = await inventoryService.getInventory('Vegetables', true);

    expect(apiMock.get).toHaveBeenCalledWith('/inventory', {
      params: { category: 'Vegetables', lowStock: true },
    });
    expect(items[0]).toMatchObject({
      id: '1',
      name: 'Tomatoes',
      category: 'Vegetables',
      quantity: 25,
      unit: 'kg',
      minStock: 10,
    });
  });

  it('updates inventory quantity using patch endpoint', async () => {
    apiMock.patch.mockResolvedValue({
      data: {
        id: 2,
        name: 'Cheese',
        category: 'Dairy',
        quantity: 12.5,
        unit: 'kg',
        minStock: 8,
        lastRestocked: '2026-04-14T08:00:00Z',
      },
    });

    const updated = await inventoryService.updateQuantity('2', 12.5);

    expect(apiMock.patch).toHaveBeenCalledWith('/inventory/2/quantity', { quantity: 12.5 });
    expect(updated).toMatchObject({
      id: '2',
      quantity: 12.5,
      minStock: 8,
    });
  });
});
