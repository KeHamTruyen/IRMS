import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Table,
  Order,
  MenuItem,
  Reservation,
  KitchenTicket,
  InventoryItem,
  DashboardStats,
  SalesData,
  OrderItem,
  OrderStatus,
} from '../types';
import {
  mockUsers,
  mockTables,
  mockOrders,
  mockMenuItems,
  mockReservations,
  mockKitchenTickets,
  mockInventory,
  mockSalesData,
} from '../utils/mock-data';
import { authService } from '../services/auth.service';

interface RestaurantContextType {
  // Current User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Tables
  tables: Table[];
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  
  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderStatus) => void;
  
  // Menu
  menuItems: MenuItem[];
  updateMenuItem: (menuItem: MenuItem) => void;
  
  // Reservations
  reservations: Reservation[];
  addReservation: (reservation: Reservation) => void;
  updateReservation: (reservation: Reservation) => void;
  
  // Kitchen
  kitchenTickets: KitchenTicket[];
  updateKitchenTicket: (ticketId: string, status: OrderStatus) => void;
  
  // Inventory
  inventory: InventoryItem[];
  updateInventoryItem: (item: InventoryItem) => void;
  
  // Analytics
  salesData: SalesData[];
  dashboardStats: DashboardStats;
  
  // Users
  users: User[];
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>(mockKitchenTickets);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [salesData] = useState<SalesData[]>(mockSalesData);
  const [users] = useState<User[]>(mockUsers);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // Calculate dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayRevenue: 1200,
    todayOrders: 22,
    activeTable: 3,
    pendingReservations: 2,
    lowStockItems: 2,
  });

  // Update dashboard stats when data changes
  useEffect(() => {
    const todayRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todayOrders = orders.length;
    const activeTable = tables.filter(t => t.status === 'occupied').length;
    const pendingReservations = reservations.filter(r => r.status === 'pending').length;
    const lowStockItems = inventory.filter(i => i.quantity < i.minStock).length;

    setDashboardStats({
      todayRevenue,
      todayOrders,
      activeTable,
      pendingReservations,
      lowStockItems,
    });
  }, [orders, tables, reservations, inventory]);

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
    
    // Update table status
    updateTableStatus(order.tableId, 'occupied');
    
    // Create kitchen ticket
    const table = tables.find(t => t.id === order.tableId);
    if (table) {
      const newTicket: KitchenTicket = {
        id: `kt${Date.now()}`,
        orderId: order.id,
        tableNumber: table.number,
        items: order.items,
        status: 'pending',
        priority: 'normal',
        createdAt: order.createdAt,
        estimatedTime: Math.max(...order.items.map(i => i.menuItem.prepTime)),
      };
      setKitchenTickets(prev => [...prev, newTicket]);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date() } : o));
    
    // Update kitchen ticket
    setKitchenTickets(prev => prev.map(kt => kt.orderId === orderId ? { ...kt, status } : kt));
  };

  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedItems = o.items.map(item => 
          item.id === itemId ? { ...item, status } : item
        );
        
        // Check if all items are ready
        const allReady = updatedItems.every(item => item.status === 'ready' || item.status === 'served');
        const orderStatus = allReady ? 'ready' : 'preparing';
        
        return { ...o, items: updatedItems, status: orderStatus, updatedAt: new Date() };
      }
      return o;
    }));

    // Update kitchen ticket
    setKitchenTickets(prev => prev.map(kt => {
      if (kt.orderId === orderId) {
        const updatedItems = kt.items.map(item => 
          item.id === itemId ? { ...item, status } : item
        );
        const allReady = updatedItems.every(item => item.status === 'ready' || item.status === 'served');
        const ticketStatus = allReady ? 'ready' : 'preparing';
        
        return { ...kt, items: updatedItems, status: ticketStatus };
      }
      return kt;
    }));
  };

  const updateMenuItem = (menuItem: MenuItem) => {
    setMenuItems(prev => prev.map(m => m.id === menuItem.id ? menuItem : m));
  };

  const addReservation = (reservation: Reservation) => {
    setReservations(prev => [...prev, reservation]);
  };

  const updateReservation = (reservation: Reservation) => {
    setReservations(prev => prev.map(r => r.id === reservation.id ? reservation : r));
  };

  const updateKitchenTicket = (ticketId: string, status: OrderStatus) => {
    setKitchenTickets(prev => prev.map(kt => kt.id === ticketId ? { ...kt, status } : kt));
    
    // Find the order and update it
    const ticket = kitchenTickets.find(kt => kt.id === ticketId);
    if (ticket) {
      updateOrderStatus(ticket.orderId, status);
    }
  };

  const updateInventoryItem = (item: InventoryItem) => {
    setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const value: RestaurantContextType = {
    currentUser,
    setCurrentUser,
    tables,
    updateTableStatus,
    orders,
    addOrder,
    updateOrderStatus,
    updateOrderItemStatus,
    menuItems,
    updateMenuItem,
    reservations,
    addReservation,
    updateReservation,
    kitchenTickets,
    updateKitchenTicket,
    inventory,
    updateInventoryItem,
    salesData,
    dashboardStats,
    users,
  };

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};