import React, { useEffect, useMemo, useState } from 'react';
import { Order, PaymentMethod } from '../../types';
import { orderService } from '../../services/order.service';
import { billingService } from '../../services/billing.service';
import { DollarSign, CreditCard, Banknote, Receipt, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const CashierDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBill, setCurrentBill] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('0');
  const [tipAmount, setTipAmount] = useState<string>('0');

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load cashier data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const payableOrders = useMemo(
    () => orders.filter(order => order.status === 'ready'),
    [orders]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  const calculateSubtotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const calculateTax = (subtotal: number) => subtotal * 0.1;

  const calculateTotal = (order: Order) => {
    const subtotal = calculateSubtotal(order);
    return subtotal + calculateTax(subtotal);
  };

  const ensureBillForOrder = async (order: Order) => {
    try {
      return await billingService.getBillByOrderId(order.id);
    } catch {
      return await billingService.createBill(order.id);
    }
  };

  const loadBillForOrder = async (order: Order) => {
    const bill = await ensureBillForOrder(order);
    setCurrentBill(bill);
    const remaining = bill.remainingDue ?? bill.total;
    setPaymentAmount(remaining.toFixed(2));
    if ((bill.tipAmount ?? 0) > 0) {
      setTipAmount((bill.tipAmount as number).toFixed(2));
    } else {
      setTipAmount('0');
    }
  };

  const handleProcessPayment = async (order: Order) => {
    try {
      const bill = currentBill ?? await ensureBillForOrder(order);
      const amount = Number(paymentAmount);
      const tip = Number(tipAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error('Payment amount must be greater than 0');
        return;
      }

      const appliedTip = (bill.amountPaid ?? 0) > 0 ? undefined : (tip > 0 ? tip : undefined);
      const updated = await billingService.processPayment(
        bill.id,
        amount,
        paymentMethod,
        undefined,
        undefined,
        appliedTip
      );

      setCurrentBill(updated);

      if ((updated.remainingDue ?? 0) > 0) {
        setPaymentAmount((updated.remainingDue as number).toFixed(2));
        toast.success(`Partial payment accepted. Remaining: $${(updated.remainingDue as number).toFixed(2)}`);
      } else {
        toast.success(`Payment completed for Table ${order.tableName ?? order.tableId}`);
        setSelectedOrder(null);
        setCurrentBill(null);
      }

      await loadOrders();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Payment failed');
    }
  };

  const handleDownloadReceipt = async () => {
    if (!currentBill) return;
    try {
      const blob = await billingService.downloadReceipt(currentBill.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${currentBill.id}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to download receipt');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <RefreshCw className="size-8 mx-auto mb-3 animate-spin" />
          <p>Loading cashier dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cashier Dashboard</h1>
            <p className="text-gray-600">Process payments and manage billing</p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payable Bills</p>
                <p className="text-3xl font-bold text-orange-600">{payableOrders.length}</p>
              </div>
              <Receipt className="size-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Revenue</p>
                <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
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
                  ${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <Receipt className="size-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Pay</h2>

            <div className="space-y-3">
              {payableOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Receipt className="size-12 mx-auto mb-3" />
                  <p>No ready orders for billing</p>
                </div>
              ) : (
                payableOrders.map(order => {
                  const total = calculateTotal(order);

                  return (
                    <button
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        void loadBillForOrder(order);
                      }}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedOrder?.id === order.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            Table {order.tableName ?? order.tableId}
                          </h3>
                          <p className="text-sm text-gray-600">Order #{order.id.slice(-6)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">${total.toFixed(2)}</p>
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            ready
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bill Details</h2>

            {!selectedOrder ? (
              <div className="text-center py-12 text-gray-400">
                <Receipt className="size-12 mx-auto mb-3" />
                <p>Select an order to view details</p>
              </div>
            ) : (
              <div>
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Table {selectedOrder.tableName ?? selectedOrder.tableId}
                  </h3>
                  <p className="text-sm text-gray-600">Order #{selectedOrder.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">Server: {selectedOrder.serverName}</p>
                  <p className="text-sm text-gray-600">
                    Time: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

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

                <div className="mb-6 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${(currentBill?.subtotal ?? calculateSubtotal(selectedOrder)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${(currentBill?.tax ?? calculateTax(calculateSubtotal(selectedOrder))).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service Charge</span>
                    <span>${(currentBill?.serviceCharge ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tip</span>
                      <span>${(currentBill?.tipAmount ?? (Number(tipAmount) || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${(currentBill?.total ?? calculateTotal(selectedOrder)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Paid</span>
                    <span>${(currentBill?.amountPaid ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-orange-700">
                    <span>Remaining Due</span>
                    <span>${(currentBill?.remainingDue ?? currentBill?.total ?? calculateTotal(selectedOrder)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tip (first payment)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      disabled={(currentBill?.amountPaid ?? 0) > 0}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                    />
                  </div>
                </div>

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
                      <Banknote className={`size-8 mx-auto mb-2 ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-400'}`} />
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
                      <CreditCard className={`size-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
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
                      <DollarSign className={`size-8 mx-auto mb-2 ${paymentMethod === 'transfer' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900">Transfer</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => void handleProcessPayment(selectedOrder)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="size-6" />
                  Process Payment - ${Number(paymentAmount || '0').toFixed(2)}
                </button>

                {currentBill?.paymentStatus === 'paid' && (
                  <button
                    onClick={() => void handleDownloadReceipt()}
                    className="mt-3 w-full border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                  >
                    Download Receipt
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
