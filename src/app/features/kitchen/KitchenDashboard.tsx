import React, { useEffect, useMemo, useState } from 'react';
import { KitchenTicket } from '../../types';
import { kitchenService } from '../../services/kitchen.service';
import { Clock, CheckCircle, AlertCircle, ChefHat, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const KitchenDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      const data = await kitchenService.getActiveOrders();
      setTickets(data);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to load kitchen orders';
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const pendingTickets = useMemo(() => tickets.filter(ticket => ticket.status === 'pending'), [tickets]);
  const preparingTickets = useMemo(() => tickets.filter(ticket => ticket.status === 'preparing'), [tickets]);
  const readyTickets = useMemo(() => tickets.filter(ticket => ticket.status === 'ready'), [tickets]);

  const refreshTickets = async () => {
    setRefreshing(true);
    await loadTickets();
  };

  const completeKitchenItem = async (item: KitchenTicket['items'][number]) => {
    if (item.status === 'pending') {
      await kitchenService.startPreparation(item.id);
    }

    if (item.status !== 'ready' && item.status !== 'served') {
      await kitchenService.markAsReady(item.id);
    }
  };

  const handleStartCooking = async (ticket: KitchenTicket) => {
    try {
      await Promise.all(ticket.items.map(item => item.status === 'pending' ? kitchenService.startPreparation(item.id) : Promise.resolve()));
      toast.success('Started preparing order');
      await refreshTickets();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to start cooking');
    }
  };

  const handleMarkItemReady = async (ticket: KitchenTicket, itemId: string) => {
    try {
      const item = ticket.items.find(entry => entry.id === itemId);
      if (!item) return;

      await completeKitchenItem(item);
      toast.success('Item marked as ready');
      await refreshTickets();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to update item status');
    }
  };

  const handleMarkTicketReady = async (ticket: KitchenTicket) => {
    try {
      await Promise.all(ticket.items.map(item => completeKitchenItem(item)));
      toast.success('Order ready for pickup!');
      await refreshTickets();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Unable to complete order');
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high'
      ? 'border-red-400 bg-red-50'
      : 'border-orange-200 bg-white';
  };

  const getTimeSince = (date: Date) => {
    return Math.floor((Date.now() - date.getTime()) / 60000);
  };

  const TicketCard: React.FC<{ ticket: KitchenTicket; showActions?: boolean }> = ({
    ticket,
    showActions = true,
  }) => {
    const timeElapsed = getTimeSince(ticket.createdAt);
    const isUrgent = timeElapsed > 20;

    return (
      <div
        className={`border-2 rounded-xl p-4 ${getPriorityColor(ticket.priority)} ${
          selectedTicket === ticket.id ? 'ring-2 ring-orange-500' : ''
        }`}
        onClick={() => setSelectedTicket(ticket.id)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Table {ticket.tableNumber || ticket.orderId}</h3>
            <p className="text-sm text-gray-600">Order #{ticket.orderId.slice(-6)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {ticket.priority === 'high' && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                HIGH PRIORITY
              </span>
            )}
            <div className={`flex items-center gap-1 text-sm ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
              <Clock className="size-4" />
              <span>{timeElapsed} min ago</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {ticket.items.map(item => {
            const isItemReady = item.status === 'ready' || item.status === 'served';
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-2 rounded-lg ${
                  isItemReady ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                {showActions && ticket.status === 'preparing' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleMarkItemReady(ticket, item.id);
                    }}
                    disabled={isItemReady}
                    className={`mt-1 ${
                      isItemReady ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                    }`}
                  >
                    <CheckCircle className={`size-5 ${isItemReady ? 'fill-green-500' : ''}`} />
                  </button>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{item.quantity}x</span>
                    <span className={isItemReady ? 'line-through text-gray-500' : 'text-gray-900'}>
                      {item.menuItem.name}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {item.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Prep time: {item.menuItem.prepTime} min</p>
                </div>

                {isItemReady && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Ready</span>
                )}
              </div>
            );
          })}
        </div>

        {showActions && (
          <div>
            {ticket.status === 'pending' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void handleStartCooking(ticket);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Start Cooking
              </button>
            )}

            {ticket.status === 'preparing' && (
              <div>
                <div className="text-sm text-gray-600 mb-2 text-center">
                  {ticket.items.filter(i => i.status === 'ready' || i.status === 'served').length} / {ticket.items.length} items ready
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleMarkTicketReady(ticket);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Mark as Ready
                </button>
              </div>
            )}

            {ticket.status === 'ready' && (
              <div className="bg-green-100 text-green-700 text-center py-2 rounded-lg font-medium">
                Ready for Pickup
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
          <span className="text-gray-600">Est. completion:</span>
          <span className="font-medium text-gray-900">{ticket.estimatedTime} min</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <RefreshCw className="size-8 mx-auto mb-3 animate-spin" />
          <p>Loading kitchen display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <ChefHat className="size-10 text-orange-500" />
              Kitchen Display System
            </h1>
            <p className="text-gray-600">Manage incoming orders and food preparation</p>
          </div>
          <button
            onClick={refreshTickets}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 mb-1">Pending Orders</p>
                <p className="text-4xl font-bold text-yellow-600">{pendingTickets.length}</p>
              </div>
              <Clock className="size-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-800 mb-1">Preparing</p>
                <p className="text-4xl font-bold text-orange-600">{preparingTickets.length}</p>
              </div>
              <ChefHat className="size-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 mb-1">Ready</p>
                <p className="text-4xl font-bold text-green-600">{readyTickets.length}</p>
              </div>
              <CheckCircle className="size-12 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-yellow-500 rounded"></span>
              Pending ({pendingTickets.length})
            </h2>
            <div className="space-y-4">
              {pendingTickets.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                  No pending orders
                </div>
              ) : (
                pendingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded"></span>
              Preparing ({preparingTickets.length})
            </h2>
            <div className="space-y-4">
              {preparingTickets.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                  No orders in preparation
                </div>
              ) : (
                preparingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded"></span>
              Ready ({readyTickets.length})
            </h2>
            <div className="space-y-4">
              {readyTickets.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                  No ready orders
                </div>
              ) : (
                readyTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} showActions={false} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
