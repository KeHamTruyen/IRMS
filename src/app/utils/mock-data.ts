import { MenuItem, Table, Order, OrderItem, Reservation, Bill, KitchenTicket, InventoryItem, SalesData, User } from '../types';

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'John Server', role: 'server', avatar: 'JS' },
  { id: '2', name: 'Maria Chef', role: 'chef', avatar: 'MC' },
  { id: '3', name: 'Tom Cashier', role: 'cashier', avatar: 'TC' },
  { id: '4', name: 'Sarah Host', role: 'host', avatar: 'SH' },
  { id: '5', name: 'David Manager', role: 'manager', avatar: 'DM' },
  { id: '6', name: 'Admin User', role: 'admin', avatar: 'AU' },
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  {
    id: 'm1',
    name: 'Margherita Pizza',
    category: 'Main Course',
    price: 12.99,
    description: 'Classic tomato, mozzarella, and basil',
    available: true,
    prepTime: 15,
  },
  {
    id: 'm2',
    name: 'Caesar Salad',
    category: 'Appetizer',
    price: 8.99,
    description: 'Fresh romaine lettuce with Caesar dressing',
    available: true,
    prepTime: 5,
  },
  {
    id: 'm3',
    name: 'Grilled Salmon',
    category: 'Main Course',
    price: 22.99,
    description: 'Atlantic salmon with seasonal vegetables',
    available: true,
    prepTime: 20,
  },
  {
    id: 'm4',
    name: 'Beef Burger',
    category: 'Main Course',
    price: 14.99,
    description: 'Angus beef with cheese and fries',
    available: true,
    prepTime: 12,
  },
  {
    id: 'm5',
    name: 'Pasta Carbonara',
    category: 'Main Course',
    price: 13.99,
    description: 'Creamy pasta with bacon and parmesan',
    available: true,
    prepTime: 10,
  },
  {
    id: 'm6',
    name: 'Chocolate Cake',
    category: 'Dessert',
    price: 6.99,
    description: 'Rich chocolate cake with vanilla ice cream',
    available: true,
    prepTime: 3,
  },
  {
    id: 'm7',
    name: 'Iced Tea',
    category: 'Beverage',
    price: 3.99,
    description: 'Refreshing iced tea with lemon',
    available: true,
    prepTime: 2,
  },
  {
    id: 'm8',
    name: 'French Onion Soup',
    category: 'Appetizer',
    price: 7.99,
    description: 'Classic soup with melted cheese',
    available: true,
    prepTime: 8,
  },
  {
    id: 'm9',
    name: 'Fish and Chips',
    category: 'Main Course',
    price: 15.99,
    description: 'Crispy battered fish with chips',
    available: false,
    prepTime: 15,
  },
  {
    id: 'm10',
    name: 'Tiramisu',
    category: 'Dessert',
    price: 7.99,
    description: 'Italian coffee-flavored dessert',
    available: true,
    prepTime: 3,
  },
];

// Mock Tables
export const mockTables: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'occupied', currentOrderId: 'o1', section: 'Indoor' },
  { id: 't2', number: 2, capacity: 4, status: 'available', section: 'Indoor' },
  { id: 't3', number: 3, capacity: 4, status: 'occupied', currentOrderId: 'o2', section: 'Indoor' },
  { id: 't4', number: 4, capacity: 6, status: 'reserved', section: 'Indoor' },
  { id: 't5', number: 5, capacity: 2, status: 'available', section: 'Outdoor' },
  { id: 't6', number: 6, capacity: 8, status: 'occupied', currentOrderId: 'o3', section: 'Outdoor' },
  { id: 't7', number: 7, capacity: 4, status: 'cleaning', section: 'Outdoor' },
  { id: 't8', number: 8, capacity: 2, status: 'available', section: 'Indoor' },
  { id: 't9', number: 9, capacity: 6, status: 'reserved', section: 'Indoor' },
  { id: 't10', number: 10, capacity: 4, status: 'available', section: 'Outdoor' },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'o1',
    tableId: 't1',
    items: [
      {
        id: 'oi1',
        menuItem: mockMenuItems[0],
        quantity: 2,
        status: 'preparing',
        notes: 'Extra cheese',
      },
      {
        id: 'oi2',
        menuItem: mockMenuItems[6],
        quantity: 2,
        status: 'ready',
      },
    ],
    status: 'preparing',
    serverId: '1',
    serverName: 'John Server',
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(Date.now() - 5 * 60000),
    totalAmount: 33.96,
  },
  {
    id: 'o2',
    tableId: 't3',
    items: [
      {
        id: 'oi3',
        menuItem: mockMenuItems[2],
        quantity: 1,
        status: 'preparing',
      },
      {
        id: 'oi4',
        menuItem: mockMenuItems[1],
        quantity: 1,
        status: 'ready',
      },
      {
        id: 'oi5',
        menuItem: mockMenuItems[6],
        quantity: 1,
        status: 'ready',
      },
    ],
    status: 'preparing',
    serverId: '1',
    serverName: 'John Server',
    createdAt: new Date(Date.now() - 25 * 60000),
    updatedAt: new Date(Date.now() - 3 * 60000),
    totalAmount: 35.97,
  },
  {
    id: 'o3',
    tableId: 't6',
    items: [
      {
        id: 'oi6',
        menuItem: mockMenuItems[3],
        quantity: 3,
        status: 'pending',
      },
      {
        id: 'oi7',
        menuItem: mockMenuItems[4],
        quantity: 2,
        status: 'pending',
      },
      {
        id: 'oi8',
        menuItem: mockMenuItems[5],
        quantity: 2,
        status: 'pending',
      },
    ],
    status: 'pending',
    serverId: '1',
    serverName: 'John Server',
    createdAt: new Date(Date.now() - 2 * 60000),
    updatedAt: new Date(Date.now() - 2 * 60000),
    totalAmount: 86.93,
  },
];

// Mock Reservations
export const mockReservations: Reservation[] = [
  {
    id: 'r1',
    customerName: 'Alice Johnson',
    customerPhone: '+1234567890',
    guestCount: 4,
    date: new Date(),
    time: '19:00',
    status: 'confirmed',
    tableId: 't4',
    notes: 'Window seat preferred',
  },
  {
    id: 'r2',
    customerName: 'Bob Smith',
    customerPhone: '+1234567891',
    guestCount: 6,
    date: new Date(),
    time: '20:30',
    status: 'pending',
    notes: 'Birthday celebration',
  },
  {
    id: 'r3',
    customerName: 'Carol White',
    customerPhone: '+1234567892',
    guestCount: 2,
    date: new Date(Date.now() + 86400000),
    time: '18:00',
    status: 'confirmed',
    tableId: 't9',
  },
  {
    id: 'r4',
    customerName: 'David Brown',
    customerPhone: '+1234567893',
    guestCount: 8,
    date: new Date(Date.now() + 86400000),
    time: '19:30',
    status: 'pending',
    notes: 'Corporate dinner',
  },
];

// Mock Kitchen Tickets
export const mockKitchenTickets: KitchenTicket[] = [
  {
    id: 'kt1',
    orderId: 'o1',
    tableNumber: 1,
    items: mockOrders[0].items,
    status: 'preparing',
    priority: 'normal',
    createdAt: mockOrders[0].createdAt,
    estimatedTime: 10,
  },
  {
    id: 'kt2',
    orderId: 'o2',
    tableNumber: 3,
    items: mockOrders[1].items,
    status: 'preparing',
    priority: 'high',
    createdAt: mockOrders[1].createdAt,
    estimatedTime: 5,
  },
  {
    id: 'kt3',
    orderId: 'o3',
    tableNumber: 6,
    items: mockOrders[2].items,
    status: 'pending',
    priority: 'normal',
    createdAt: mockOrders[2].createdAt,
    estimatedTime: 15,
  },
];

// Mock Inventory
export const mockInventory: InventoryItem[] = [
  {
    id: 'inv1',
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: 25,
    unit: 'kg',
    minStock: 10,
    lastRestocked: new Date(Date.now() - 2 * 86400000),
  },
  {
    id: 'inv2',
    name: 'Mozzarella Cheese',
    category: 'Dairy',
    quantity: 5,
    unit: 'kg',
    minStock: 8,
    lastRestocked: new Date(Date.now() - 1 * 86400000),
  },
  {
    id: 'inv3',
    name: 'Salmon Fillet',
    category: 'Seafood',
    quantity: 15,
    unit: 'kg',
    minStock: 5,
    lastRestocked: new Date(Date.now() - 1 * 86400000),
  },
  {
    id: 'inv4',
    name: 'Beef Patty',
    category: 'Meat',
    quantity: 30,
    unit: 'pieces',
    minStock: 20,
    lastRestocked: new Date(Date.now() - 3 * 86400000),
  },
  {
    id: 'inv5',
    name: 'Pasta',
    category: 'Dry Goods',
    quantity: 8,
    unit: 'kg',
    minStock: 10,
    lastRestocked: new Date(Date.now() - 5 * 86400000),
  },
];

// Mock Sales Data
export const mockSalesData: SalesData[] = [
  { date: '2026-03-10', revenue: 2450, orders: 45, averageOrderValue: 54.44 },
  { date: '2026-03-11', revenue: 2890, orders: 52, averageOrderValue: 55.58 },
  { date: '2026-03-12', revenue: 3120, orders: 58, averageOrderValue: 53.79 },
  { date: '2026-03-13', revenue: 2780, orders: 48, averageOrderValue: 57.92 },
  { date: '2026-03-14', revenue: 3450, orders: 62, averageOrderValue: 55.65 },
  { date: '2026-03-15', revenue: 3890, orders: 68, averageOrderValue: 57.21 },
  { date: '2026-03-16', revenue: 3650, orders: 65, averageOrderValue: 56.15 },
  { date: '2026-03-17', revenue: 1200, orders: 22, averageOrderValue: 54.55 },
];
