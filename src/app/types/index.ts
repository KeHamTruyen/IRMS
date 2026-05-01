// User & Authentication
export type UserRole = 'server' | 'chef' | 'cashier' | 'host' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Menu & Items
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  available: boolean;
  prepTime: number; // in minutes
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  tableId: string;
  tableName?: string;
  items: OrderItem[];
  status: OrderStatus;
  serverId: string;
  serverName: string;
  createdAt: Date;
  updatedAt: Date;
  totalAmount: number;
}

// Table Management
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  section: string;
}

// Reservation
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  date: Date;
  time: string;
  status: ReservationStatus;
  tableId?: string;
  notes?: string;
}

// Billing & Payment
export interface Bill {
  id: string;
  orderId: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  serviceCharge?: number;
  tipAmount?: number;
  total: number;
  amountPaid?: number;
  remainingDue?: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
  createdAt: Date;
}

// Kitchen
export interface KitchenTicket {
  id: string;
  orderId: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  priority: 'low' | 'normal' | 'high';
  createdAt: Date;
  estimatedTime: number;
}

// Inventory
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  lastRestocked: Date;
}

// Analytics & Reporting
export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeTable: number;
  pendingReservations: number;
  lowStockItems: number;
}
