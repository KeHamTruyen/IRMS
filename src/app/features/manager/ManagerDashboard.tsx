import React from 'react';
import { useRestaurant } from '../../store/RestaurantContext';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ManagerDashboard: React.FC = () => {
  const { dashboardStats, salesData, inventory, menuItems, orders } = useRestaurant();

  const lowStockItems = inventory.filter(item => item.quantity < item.minStock);
  
  const topSellingItems = menuItems
    .map(item => {
      const totalSold = orders.reduce((sum, order) => {
        const orderItems = order.items.filter(oi => oi.menuItem.id === item.id);
        return sum + orderItems.reduce((s, oi) => s + oi.quantity, 0);
      }, 0);
      return { ...item, sold: totalSold };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Business analytics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="size-10" />
              <TrendingUp className="size-6" />
            </div>
            <p className="text-green-100 text-sm mb-1">Today's Revenue</p>
            <p className="text-3xl font-bold">${dashboardStats.todayRevenue.toFixed(2)}</p>
            <p className="text-green-100 text-xs mt-2">+12.5% vs yesterday</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="size-10" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Today's Orders</p>
            <p className="text-3xl font-bold">{dashboardStats.todayOrders}</p>
            <p className="text-blue-100 text-xs mt-2">
              Avg: ${dashboardStats.todayOrders > 0 ? (dashboardStats.todayRevenue / dashboardStats.todayOrders).toFixed(2) : '0.00'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="size-10" />
            </div>
            <p className="text-purple-100 text-sm mb-1">Active Tables</p>
            <p className="text-3xl font-bold">{dashboardStats.activeTable}</p>
            <p className="text-purple-100 text-xs mt-2">Out of 10 tables</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="size-10" />
            </div>
            <p className="text-orange-100 text-sm mb-1">Reservations</p>
            <p className="text-3xl font-bold">{dashboardStats.pendingReservations}</p>
            <p className="text-orange-100 text-xs mt-2">Pending today</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="size-10" />
            </div>
            <p className="text-red-100 text-sm mb-1">Low Stock Items</p>
            <p className="text-3xl font-bold">{dashboardStats.lowStockItems}</p>
            <p className="text-red-100 text-xs mt-2">Need restock</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Items</h2>
            <div className="space-y-3">
              {topSellingItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.sold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${(item.price * item.sold).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Orders</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inventory Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="size-6 text-red-500" />
              Low Stock Alerts
            </h2>
            
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="size-12 mx-auto mb-2" />
                <p className="text-sm">All items are well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map(item => (
                  <div key={item.id} className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                        LOW
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Current Stock:</span>
                      <span className="font-semibold text-red-600">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Min Required:</span>
                      <span className="font-semibold text-gray-900">
                        {item.minStock} {item.unit}
                      </span>
                    </div>
                    <button className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      Restock Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
