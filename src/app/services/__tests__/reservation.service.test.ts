import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

import { reservationService } from '../reservation.service';

describe('reservationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps reservation responses into frontend reservations', async () => {
    apiMock.get.mockResolvedValue({
      data: [
        {
          id: 1,
          customerName: 'Alice Johnson',
          customerPhone: '555-1010',
          guestCount: 4,
          reservationDate: '2026-04-14',
          reservationTime: '19:00:00',
          status: 'CONFIRMED',
          tableId: 4,
          notes: 'Window seat preferred',
          createdAt: '2026-04-14T10:00:00Z',
          updatedAt: '2026-04-14T10:00:00Z',
        },
      ],
    });

    const result = await reservationService.getReservations(new Date('2026-04-14'), 'confirmed');

    expect(apiMock.get).toHaveBeenCalledWith('/reservations', {
      params: { date: '2026-04-14', status: 'CONFIRMED' },
    });
    expect(result[0]).toMatchObject({
      id: '1',
      customerName: 'Alice Johnson',
      customerPhone: '555-1010',
      guestCount: 4,
      time: '19:00',
      status: 'confirmed',
      tableId: '4',
      notes: 'Window seat preferred',
    });
  });

  it('creates reservation with backend payload shape', async () => {
    apiMock.post.mockResolvedValue({
      data: {
        id: 2,
        customerName: 'Bob Smith',
        customerPhone: '555-2020',
        guestCount: 6,
        reservationDate: '2026-04-14',
        reservationTime: '20:30:00',
        status: 'PENDING',
        createdAt: '2026-04-14T10:00:00Z',
        updatedAt: '2026-04-14T10:00:00Z',
      },
    });

    const created = await reservationService.createReservation({
      customerName: 'Bob Smith',
      customerPhone: '555-2020',
      guestCount: 6,
      date: '2026-04-14',
      time: '20:30',
      notes: 'Birthday celebration',
    });

    expect(apiMock.post).toHaveBeenCalledWith('/reservations', {
      customerName: 'Bob Smith',
      customerPhone: '555-2020',
      guestCount: 6,
      reservationDate: '2026-04-14',
      reservationTime: '20:30',
      notes: 'Birthday celebration',
    });
    expect(created.status).toBe('pending');
  });

  it('updates status and assigns table using patch endpoints', async () => {
    apiMock.patch
      .mockResolvedValueOnce({
        data: {
          id: 3,
          customerName: 'Carol',
          customerPhone: '555-3030',
          guestCount: 2,
          reservationDate: '2026-04-15',
          reservationTime: '18:00:00',
          status: 'SEATED',
          tableId: 9,
          createdAt: '2026-04-14T10:00:00Z',
          updatedAt: '2026-04-14T10:05:00Z',
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: 3,
          customerName: 'Carol',
          customerPhone: '555-3030',
          guestCount: 2,
          reservationDate: '2026-04-15',
          reservationTime: '18:00:00',
          status: 'CONFIRMED',
          tableId: 9,
          createdAt: '2026-04-14T10:00:00Z',
          updatedAt: '2026-04-14T10:05:00Z',
        },
      });

    const seated = await reservationService.updateReservationStatus('3', 'seated');
    const assigned = await reservationService.assignTable('3', '9');

    expect(apiMock.patch).toHaveBeenNthCalledWith(1, '/reservations/3/status', null, {
      params: { status: 'SEATED' },
    });
    expect(apiMock.patch).toHaveBeenNthCalledWith(2, '/reservations/3/assign-table', null, {
      params: { tableId: 9 },
    });
    expect(seated.status).toBe('seated');
    expect(assigned.tableId).toBe('9');
  });
});
