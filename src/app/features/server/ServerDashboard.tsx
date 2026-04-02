import React, { useState } from 'react';
import { useRestaurant } from '../../store/RestaurantContext';
import { Table, TableStatus } from '../../types';
import { Plus, Users, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { TakeOrderModal } from './TakeOrderModal';

export const ServerDashboard: React.FC = () => {
  const { tables, orders } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const getTableColor = (status: TableStatus) => {
    const colors = {
      available: 'bg-green-100 border-green-300 hover:border-green-400',
      occupied: 'bg-orange-100 border-orange-300 hover:border-orange-400',
      reserved: 'bg-blue-100 border-blue-300 hover:border-blue-400',
      cleaning: 'bg-gray-100 border-gray-300 hover:border-gray-400',
    };
    return colors[status];
  };

  const getStatusBadgeColor = (status: TableStatus) => {
    const colors = {
      available: 'bg-green-500',
      occupied: 'bg-orange-500',
      reserved: 'bg-blue-500',
      cleaning: 'bg-gray-500',
    };
    return colors[status];
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'available' || table.status === 'occupied') {
      setShowOrderModal(true);
    }
  };

  const getTableOrder = (table: Table) => {
    if (!table.currentOrderId) return null;
    return orders.find(o => o.id === table.currentOrderId);
  };

  const stats = {
    totalTables: tables.length,
    occupiedTables: tables.filter(t => t.status === 'occupied').length,
    activeOrders: orders.filter(o => o.status !== 'served').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Server Dashboard</h1>
          <p className="text-gray-600">Manage tables and take orders</p>
        </div>

        {/* Stats */}
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

        {/* Tables Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Table Overview</h2>
          
          {/* Indoor Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded"></span>
              Indoor Tables
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.filter(t => t.section === 'Indoor').map(table => {
                const order = getTableOrder(table);
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${getTableColor(table.status)}`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`absolute top-2 right-2 size-3 rounded-full ${getStatusBadgeColor(table.status)}`}></div>
                      
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {table.number}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <Users className="size-4" />
                        <span>{table.capacity}</span>
                      </div>
                      
                      <div className="text-xs font-medium text-gray-600 capitalize">
                        {table.status}
                      </div>

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

          {/* Outdoor Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded"></span>
              Outdoor Tables
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.filter(t => t.section === 'Outdoor').map(table => {
                const order = getTableOrder(table);
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${getTableColor(table.status)}`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`absolute top-2 right-2 size-3 rounded-full ${getStatusBadgeColor(table.status)}`}></div>
                      
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {table.number}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <Users className="size-4" />
                        <span>{table.capacity}</span>
                      </div>
                      
                      <div className="text-xs font-medium text-gray-600 capitalize">
                        {table.status}
                      </div>

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
        </div>
      </div>

      {/* Take Order Modal */}
      {showOrderModal && selectedTable && (
        <TakeOrderModal
          table={selectedTable}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
};
