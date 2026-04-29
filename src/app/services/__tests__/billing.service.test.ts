import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../api', () => ({
  default: apiMock,
}));

import { billingService } from '../billing.service';

describe('billingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps bills from backend responses', async () => {
    apiMock.get.mockResolvedValue({
      data: [
        {
          id: 1,
          billNumber: 'BILL-1',
          orderId: 44,
          subtotal: 100,
          tax: 10,
          discount: 5,
          serviceCharge: 5,
          totalAmount: 110,
          status: 'PAID',
          createdAt: '2026-04-14T10:00:00Z',
          paidAt: '2026-04-14T10:10:00Z',
          payments: [
            {
              id: 8,
              amount: 110,
              paymentMethod: 'CREDIT_CARD',
              status: 'COMPLETED',
              processedAt: '2026-04-14T10:10:00Z',
              processedBy: 3,
            },
          ],
        },
      ],
    });

    const bills = await billingService.getBills();

    expect(apiMock.get).toHaveBeenCalledWith('/bills');
    expect(bills[0]).toMatchObject({
      id: '1',
      orderId: '44',
      subtotal: 100,
      tax: 10,
      discount: 5,
      total: 110,
      paymentStatus: 'paid',
      paymentMethod: 'card',
    });
  });

  it('creates bills and processes card payments using backend payloads', async () => {
    apiMock.post
      .mockResolvedValueOnce({
        data: {
          id: 2,
          billNumber: 'BILL-2',
          orderId: 45,
          subtotal: 200,
          tax: 20,
          discount: 0,
          serviceCharge: 10,
          totalAmount: 230,
          status: 'PENDING',
          createdAt: '2026-04-14T10:00:00Z',
          payments: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: 2,
          billNumber: 'BILL-2',
          orderId: 45,
          subtotal: 200,
          tax: 20,
          discount: 0,
          serviceCharge: 10,
          totalAmount: 230,
          status: 'PAID',
          createdAt: '2026-04-14T10:00:00Z',
          paidAt: '2026-04-14T10:11:00Z',
          payments: [
            {
              id: 9,
              amount: 230,
              paymentMethod: 'CREDIT_CARD',
              status: 'COMPLETED',
              processedAt: '2026-04-14T10:11:00Z',
              processedBy: 3,
            },
          ],
        },
      });

    await billingService.createBill('45', 12);
    const bill = await billingService.processPayment('2', 230, 'card', 'txn-1', 'Paid by card');

    expect(apiMock.post).toHaveBeenNthCalledWith(1, '/bills', {
      orderId: 45,
      discount: 12,
    });
    expect(apiMock.post).toHaveBeenNthCalledWith(2, '/bills/2/payments', {
      amount: 230,
      paymentMethod: 'CREDIT_CARD',
      transactionId: 'txn-1',
      notes: 'Paid by card',
    });
    expect(bill.paymentStatus).toBe('paid');
    expect(bill.paymentMethod).toBe('card');
  });
});