// Kitchen Service
import api from './api';
import { KitchenTicket, OrderItem, MenuItem } from '../types';
import { orderService } from './order.service';

// Backend DTO
interface KitchenOrderResponse {
  id: number;
  orderId: number;
  orderItemId: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  specialInstructions?: string;
  status: string;
  assignedChefId?: number;
  priority?: number;
  receivedAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedPrepTime: number;
}

// Map backend kitchen order status
const mapKitchenStatus = (backendStatus: string): KitchenTicket['status'] => {
  const statusMap: Record<string, KitchenTicket['status']> = {
    'PENDING': 'pending',
    'IN_PROGRESS': 'preparing',
    'READY': 'ready',
    'SERVED': 'served',
  };
  return statusMap[backendStatus] || 'pending';
};

const combineTicketStatus = (statuses: KitchenTicket['status'][]): KitchenTicket['status'] => {
  if (statuses.every(status => status === 'served')) return 'served';
  if (statuses.every(status => status === 'ready')) return 'ready';
  if (statuses.some(status => status === 'preparing' || status === 'ready' || status === 'served')) {
    return 'preparing';
  }
  return 'pending';
};

// Map priority
const mapPriority = (priority?: number): 'low' | 'normal' | 'high' => {
  if (!priority) return 'normal';
  if (priority >= 3) return 'high';
  if (priority <= 1) return 'low';
  return 'normal';
};

// Group kitchen orders by orderId into tickets
const groupIntoTickets = async (orders: KitchenOrderResponse[]): Promise<KitchenTicket[]> => {
  const ticketMap = new Map<number, KitchenTicket>();
  const orderInfoMap = new Map<number, { tableName?: string }>();

  await Promise.all(
    Array.from(new Set(orders.map(order => order.orderId))).map(async (orderId) => {
      try {
        const order = await orderService.getOrderById(orderId.toString());
        orderInfoMap.set(orderId, { tableName: order.tableName });
      } catch {
        orderInfoMap.set(orderId, {});
      }
    })
  );
  
  orders.forEach(order => {
    if (!ticketMap.has(order.orderId)) {
      const tableName = orderInfoMap.get(order.orderId)?.tableName;
      const tableNumber = tableName
        ? parseInt(tableName.replace(/\D/g, ''), 10) || 0
        : 0;

      ticketMap.set(order.orderId, {
        id: order.orderId.toString(),
        orderId: order.orderId.toString(),
        tableNumber,
        items: [],
        status: mapKitchenStatus(order.status),
        priority: mapPriority(order.priority),
        createdAt: new Date(order.receivedAt),
        estimatedTime: 0,
      });
    }
    
    const ticket = ticketMap.get(order.orderId)!;
    
    // Add item to ticket
    ticket.items.push({
      id: order.id.toString(),
      menuItem: {
        id: order.menuItemId.toString(),
        name: order.itemName,
        category: '',
        price: 0,
        available: true,
        prepTime: order.estimatedPrepTime,
      } as MenuItem,
      quantity: order.quantity,
      notes: order.specialInstructions,
      status: mapKitchenStatus(order.status),
    });
    
    // Update estimated time
    ticket.estimatedTime = Math.max(ticket.estimatedTime, order.estimatedPrepTime);
    ticket.status = combineTicketStatus(ticket.items.map(item => item.status));
  });
  
  return Array.from(ticketMap.values());
};

export const kitchenService = {
  // Get active kitchen orders
  async getActiveOrders(): Promise<KitchenTicket[]> {
    const response = await api.get<KitchenOrderResponse[]>('/kitchen/orders');
    const data = (response as any).data || response;
    const orders = Array.isArray(data) ? data : [];
    return groupIntoTickets(orders);
  },

  // Start preparing an order
  async startPreparation(kitchenOrderId: string): Promise<void> {
    await api.patch(`/kitchen/orders/${kitchenOrderId}/start`);
  },

  // Mark order as ready
  async markAsReady(kitchenOrderId: string): Promise<void> {
    await api.patch(`/kitchen/orders/${kitchenOrderId}/ready`);
  },

  // Mark order as served
  async markAsServed(kitchenOrderId: string): Promise<void> {
    await api.patch(`/kitchen/orders/${kitchenOrderId}/served`);
  },
};
