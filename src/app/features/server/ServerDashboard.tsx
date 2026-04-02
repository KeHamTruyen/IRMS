import React, { useEffect, useMemo, useState } from 'react';
import { Table, Order, MenuItem } from '../../types';
import { tableService } from '../../services/table.service';
import { orderService } from '../../services/order.service';
import { menuService } from '../../services/menu.service';
import { Plus, Users, Clock, DollarSign, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { TakeOrderModal } from './TakeOrderModal';

const getTableColor = (status: Table['status']) => {
  const colors = {
    available: 'bg-green-100 border-green-300 hover:border-green-400',
    occupied: 'bg-orange-100 border-orange-300 hover:border-orange-400',
    reserved: 'bg-blue-100 border-blue-300 hover:border-blue-400',
    cleaning: 'bg-gray-100 border-gray-300 hover:border-gray-400',
  };
  return colors[status];
};

const getStatusBadgeColor = (status: Table['status']) => {
  const colors = {
    available: 'bg-green-500',
    occupied: 'bg-orange-500',
    reserved: 'bg-blue-500',
    cleaning: 'bg-gray-500',
  };
  return colors[status];
};

export const ServerDashboard: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      const [tablesData, ordersData, menuData] = await Promise.all([
        tableService.getTables(),
        orderService.getOrders(),
        menuService.getMenuItems(),
      ]);

      setTables(tablesData);
      setOrders(ordersData);
      setMenuItems(menuData);
    } catch (loadError: any) {
      const message = loadError?.response?.data?.message || loadError?.message || 'Failed to load server data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const sectionNames = useMemo(() => {
    return Array.from(new Set(tables.map(table => table.section)));
  }, [tables]);

  const stats = useMemo(() => {
    return {
      totalTables: tables.length,
      occupiedTables: tables.filter(table => table.status === 'occupied').length,
      activeOrders: orders.filter(order => order.status !== 'served' && order.status !== 'cancelled').length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  }, [tables, orders]);

  const getTableOrder = (table: Table) => {
    if (!table.currentOrderId) return orders.find(order => order.tableId === table.id && order.status !== 'served' && order.status !== 'cancelled') || null;

    return orders.find(order => order.id === table.currentOrderId) || null;
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'available' || table.status === 'occupied') {
      setShowOrderModal(true);
    }
  };

  const handleOrderCreated = async (createdOrder: Order) => {
    setOrders(prev => [createdOrder, ...prev.filter(order => order.id !== createdOrder.id)]);
    setShowOrderModal(false);
    setSelectedTable(null);
    setRefreshing(true);
    await loadData();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <RefreshCw className="size-8 mx-auto mb-3 animate-spin" />
          <p>Loading server dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Server Dashboard</h1>
            <p className="text-gray-600">Manage tables and take orders</p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tables</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTables}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="size-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Occupied</p>
                <p className="text-3xl font-bold text-orange-600">{stats.occupiedTables}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="size-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Orders</p>
                <p className="text-3xl font-bold text-purple-600">{stats.activeOrders}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="size-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="size-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Table Overview</h2>
            <span className="text-sm text-gray-500">{menuItems.length} menu items available</span>
          </div>

          <div className="space-y-8">
            {sectionNames.map(sectionName => (
              <div key={sectionName}>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-500 rounded"></span>
                  {sectionName}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {tables.filter(table => table.section === sectionName).map(table => {
                    const order = getTableOrder(table);
                    return (
                      <button
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${getTableColor(table.status)}`}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`absolute top-2 right-2 size-3 rounded-full ${getStatusBadgeColor(table.status)}`}></div>

                          <div className="text-3xl font-bold text-gray-900 mb-1">{table.number}</div>

                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <Users className="size-4" />
                            <span>{table.capacity}</span>
                          </div>

                          <div className="text-xs font-medium text-gray-600 capitalize">{table.status}</div>

                          {order && (
                            <div className="mt-2 text-xs text-gray-500">
                              ${order.totalAmount.toFixed(2)}
                            </div>
                          )}
                        </div>

                        {table.status === 'available' && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-green-500/10 rounded-xl transition-opacity">
                            <Plus className="size-8 text-green-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showOrderModal && selectedTable && (
        <TakeOrderModal
          table={selectedTable}
          menuItems={menuItems}
          existingOrder={getTableOrder(selectedTable)}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedTable(null);
          }}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
};
