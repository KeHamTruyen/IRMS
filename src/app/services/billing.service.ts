// Billing Service
import api from './api';
import { Bill, PaymentMethod, PaymentStatus } from '../types';

// Backend DTOs
interface PaymentResponse {
  id: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  processedAt: string;
  processedBy: number;
  notes?: string;
}

interface BillResponse {
  id: number;
  billNumber: string;
  orderId: number;
  subtotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  payments: PaymentResponse[];
}

interface CreateBillRequest {
  orderId: number;
  discount?: number;
}

interface ProcessPaymentRequest {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

// Map payment method
const mapPaymentMethod = (backendMethod: string): PaymentMethod => {
  const methodMap: Record<string, PaymentMethod> = {
    'CASH': 'cash',
    'CREDIT_CARD': 'card',
    'DEBIT_CARD': 'card',
    'BANK_TRANSFER': 'transfer',
    'DIGITAL_WALLET': 'transfer',
  };
  return methodMap[backendMethod] || 'cash';
};

const mapPaymentMethodToBackend = (method: PaymentMethod): string => {
  const methodMap: Record<PaymentMethod, string> = {
    'cash': 'CASH',
    'card': 'CREDIT_CARD',
    'transfer': 'BANK_TRANSFER',
  };
  return methodMap[method];
};

// Map payment status
const mapPaymentStatus = (backendStatus: string): PaymentStatus => {
  const statusMap: Record<string, PaymentStatus> = {
    'PENDING': 'unpaid',
    'PAID': 'paid',
    'REFUNDED': 'refunded',
  };
  return statusMap[backendStatus] || 'unpaid';
};

// Map backend bill to frontend
const mapBill = (backendBill: BillResponse): Bill => {
  return {
    id: backendBill.id.toString(),
    orderId: backendBill.orderId.toString(),
    tableId: '', // Not provided by backend, would need to get from order
    items: [], // Not provided by backend, would need to get from order
    subtotal: backendBill.subtotal,
    tax: backendBill.tax,
    discount: backendBill.discount,
    total: backendBill.totalAmount,
    paymentStatus: mapPaymentStatus(backendBill.status),
    paymentMethod: backendBill.payments.length > 0 
      ? mapPaymentMethod(backendBill.payments[0].paymentMethod)
      : undefined,
    paidAt: backendBill.paidAt ? new Date(backendBill.paidAt) : undefined,
    createdAt: new Date(backendBill.createdAt),
  };
};

export const billingService = {
  // Get all bills
  async getBills(): Promise<Bill[]> {
    const response = await api.get<BillResponse[]>('/bills');
    const data = (response as any).data || response;
    const bills = Array.isArray(data) ? data : [];
    return bills.map(mapBill);
  },

  // Get bill by ID
  async getBillById(id: string): Promise<Bill> {
    const response = await api.get<BillResponse>(`/bills/${id}`);
    const data = (response as any).data || response;
    return mapBill(data);
  },

  // Create bill for an order
  async createBill(orderId: string, discount: number = 0): Promise<Bill> {
    const request: CreateBillRequest = {
      orderId: parseInt(orderId),
      discount,
    };
    
    const response = await api.post<BillResponse>('/bills', request);
    const data = (response as any).data || response;
    return mapBill(data);
  },

  // Process payment
  async processPayment(
    billId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    transactionId?: string,
    notes?: string
  ): Promise<Bill> {
    const request: ProcessPaymentRequest = {
      amount,
      paymentMethod: mapPaymentMethodToBackend(paymentMethod),
      transactionId,
      notes,
    };
    
    const response = await api.post<BillResponse>(
      `/bills/${billId}/payments`,
      request
    );
    const data = (response as any).data || response;
    return mapBill(data);
  },
};
