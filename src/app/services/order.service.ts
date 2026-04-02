// Order Service
import api from './api';
import { Order, OrderItem, MenuItem } from '../types';

// Backend DTOs
interface CreateOrderRequest {
  tableId: number;
  orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
  items: {
    menuItemId: number;
    quantity: number;
    specialInstructions?: string;
  }[];
  notes?: string;
}

interface OrderItemResponse {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  specialInstructions?: string;
  status: string;
}

interface OrderResponse {
  id: number;
  orderNumber: string;
  tableId: number;
  tableName: string;
  serverId: number;
  serverName: string;
  status: string;
  orderType: string;
  items: OrderItemResponse[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Map backend order status to frontend
const mapOrderStatus = (backendStatus: string): Order['status'] => {
  const statusMap: Record<string, Order['status']> = {
    'PENDING': 'pending',
    'CONFIRMED': 'preparing',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'SERVED': 'served',
    'COMPLETED': 'served',
    'CANCELLED': 'cancelled',
  };
  return statusMap[backendStatus] || 'pending';
};

const mapOrderItemStatus = (backendStatus: string): OrderItem['status'] => {
  const statusMap: Record<string, OrderItem['status']> = {
    'PENDING': 'pending',
    'CONFIRMED': 'preparing',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'SERVED': 'served',
    'CANCELLED': 'cancelled',
  };
  return statusMap[backendStatus] || 'pending';
};

// Map backend order to frontend
const mapOrder = (backendOrder: OrderResponse): Order => {
  return {
    id: backendOrder.id.toString(),
    tableId: backendOrder.tableId.toString(),
    tableName: backendOrder.tableName,
    serverId: backendOrder.serverId.toString(),
    serverName: backendOrder.serverName,
    status: mapOrderStatus(backendOrder.status),
    items: backendOrder.items.map(item => ({
      id: item.id.toString(),
      menuItem: {
        id: item.menuItemId.toString(),
        name: item.menuItemName,
        price: item.unitPrice,
        category: '',
        available: true,
        prepTime: 0,
      } as MenuItem,
      quantity: item.quantity,
      notes: item.specialInstructions,
      status: mapOrderItemStatus(item.status),
    })),
    totalAmount: backendOrder.totalAmount,
    createdAt: new Date(backendOrder.createdAt),
    updatedAt: new Date(backendOrder.updatedAt),
  };
};

export const orderService = {
  // Get all orders
  async getOrders(status?: string): Promise<Order[]> {
    const params = status ? { status: status.toUpperCase() } : {};
    const response = await api.get<OrderResponse[]>('/orders', { params });
    const data = (response as any).data || response;
    const orders = Array.isArray(data) ? data : [];
    return orders.map(mapOrder);
  },

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<OrderResponse>(`/orders/${id}`);
    const data = (response as any).data || response;
    return mapOrder(data);
  },

  // Create order
  async createOrder(
    tableId: string,
    items: Array<{ menuItemId: string; quantity: number; notes?: string }>,
    orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY' = 'DINE_IN',
    notes?: string
  ): Promise<Order> {
    const request: CreateOrderRequest = {
      tableId: parseInt(tableId),
      orderType,
      items: items.map(item => ({
        menuItemId: parseInt(item.menuItemId),
        quantity: item.quantity,
        specialInstructions: item.notes,
      })),
      notes,
    };
    
    const response = await api.post<OrderResponse>('/orders', request);
    const data = (response as any).data || response;
    return mapOrder(data);
  },

  // Update order status
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const backendStatus = status.toUpperCase();
    const response = await api.patch<OrderResponse>(
      `/orders/${id}/status`,
      null,
      { params: { status: backendStatus } }
    );
    const data = (response as any).data || response;
    return mapOrder(data);
  },
};
