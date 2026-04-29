import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

import { menuService } from '../menu.service';

describe('menuService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps menu item responses into frontend items', async () => {
    apiMock.get.mockResolvedValue({
      data: [
        {
          id: 11,
          name: 'Caesar Salad',
          category: 'Starter',
          price: 45,
          description: 'Fresh salad',
          imageUrl: '/img/salad.png',
          isAvailable: true,
          preparationTime: 8,
          createdAt: '2026-04-14T10:00:00Z',
          updatedAt: '2026-04-14T10:00:00Z',
        },
      ],
    });

    const items = await menuService.getMenuItems('Starter', true);

    expect(apiMock.get).toHaveBeenCalledWith('/menu-items', {
      params: { category: 'Starter', available: true },
    });
    expect(items[0]).toEqual({
      id: '11',
      name: 'Caesar Salad',
      category: 'Starter',
      price: 45,
      description: 'Fresh salad',
      image: '/img/salad.png',
      available: true,
      prepTime: 8,
    });
  });

  it('updates menu item availability using backend endpoint', async () => {
    apiMock.patch.mockResolvedValue({
      data: {
        id: 11,
        name: 'Caesar Salad',
        category: 'Starter',
        price: 45,
        isAvailable: false,
        preparationTime: 8,
      },
    });

    await menuService.updateAvailability('11', false);

    expect(apiMock.patch).toHaveBeenCalledWith('/menu-items/11/availability', null, {
      params: { available: false },
    });
  });
});