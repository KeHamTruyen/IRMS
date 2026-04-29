import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

import { tableService } from '../table.service';

describe('tableService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps table responses into frontend tables', async () => {
    apiMock.get.mockResolvedValue({
      data: [
        {
          id: 3,
          tableNumber: 'T12',
          capacity: 6,
          status: 'OCCUPIED',
          location: 'Patio',
        },
      ],
    });

    const tables = await tableService.getTables('occupied');

    expect(apiMock.get).toHaveBeenCalledWith('/tables', {
      params: { status: 'OCCUPIED' },
    });
    expect(tables[0]).toEqual({
      id: '3',
      number: 12,
      capacity: 6,
      status: 'occupied',
      section: 'Patio',
    });
  });

  it('updates table status using backend status values', async () => {
    apiMock.patch.mockResolvedValue({
      data: {
        id: 5,
        tableNumber: 'T5',
        capacity: 4,
        status: 'RESERVED',
        location: 'Main Hall',
      },
    });

    await tableService.updateTableStatus('5', 'reserved');

    expect(apiMock.patch).toHaveBeenCalledWith('/tables/5/status', null, {
      params: { status: 'RESERVED' },
    });
  });
});