import React, { useState } from 'react';
import { useRestaurant } from '../../store/RestaurantContext';
import { Order, PaymentMethod } from '../../types';
import { DollarSign, CreditCard, Banknote, Receipt, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const CashierDashboard: React.FC = () => {
  const { orders, tables, updateOrderStatus } = useRestaurant();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const unpaidOrders = orders.filter(o => o.status !== 'served');

  const handleProcessPayment = (order: Order) => {
    updateOrderStatus(order.id, 'served');
    toast.success(`Payment processed for Table ${tables.find(t => t.id === order.tableId)?.number}`);
    setSelectedOrder(null);
  };

  const calculateSubtotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.1; // 10% tax
  };

  const calculateTotal = (order: Order) => {
    const subtotal = calculateSubtotal(order);
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cashier Dashboard</h1>
          <p className="text-gray-600">Process payments and manage billing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Bills</p>
                <p className="text-3xl font-bold text-orange-600">{unpaidOrders.length}</p>
              </div>
              <Receipt className="size-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="size-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
              </div>
              <CheckCircle className="size-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Bill</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${orders.length > 0 ? (orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <Receipt className="size-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Bills</h2>
            
            <div className="space-y-3">
              {unpaidOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Receipt className="size-12 mx-auto mb-3" />
                  <p>No pending bills</p>
                </div>
              ) : (
                unpaidOrders.map(order => {
                  const table = tables.find(t => t.id === order.tableId);
                  const total = calculateTotal(order);
                  
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedOrder?.id === order.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">Table {table?.number}</h3>
                          <p className="text-sm text-gray-600">Order #{order.id.slice(-6)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">${total.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'ready' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {order.items.length} items • {order.serverName}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Bill Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bill Details</h2>
            
            {!selectedOrder ? (
              <div className="text-center py-12 text-gray-400">
                <Receipt className="size-12 mx-auto mb-3" />
                <p>Select an order to view details</p>
              </div>
            ) : (
              <div>
                {/* Bill Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Table {tables.find(t => t.id === selectedOrder.tableId)?.number}
                  </h3>
                  <p className="text-sm text-gray-600">Order #{selectedOrder.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">Server: {selectedOrder.serverName}</p>
                  <p className="text-sm text-gray-600">
                    Time: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <span className="text-gray-900">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          {item.notes && (
                            <p className="text-xs text-gray-500 ml-4">Note: {item.notes}</p>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="mb-6 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${calculateSubtotal(selectedOrder).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${calculateTax(calculateSubtotal(selectedOrder)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${calculateTotal(selectedOrder).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Method</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <Banknote className={`size-8 mx-auto mb-2 ${
                        paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">Cash</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <CreditCard className={`size-8 mx-auto mb-2 ${
                        paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">Card</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'transfer'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <DollarSign className={`size-8 mx-auto mb-2 ${
                        paymentMethod === 'transfer' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">Transfer</span>
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleProcessPayment(selectedOrder)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="size-6" />
                  Process Payment - ${calculateTotal(selectedOrder).toFixed(2)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
