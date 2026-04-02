import React, { useState } from 'react';
import { useRestaurant } from '../../store/RestaurantContext';
import { KitchenTicket, OrderStatus } from '../../types';
import { Clock, CheckCircle, AlertCircle, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

export const KitchenDashboard: React.FC = () => {
  const { kitchenTickets, updateKitchenTicket, updateOrderItemStatus } = useRestaurant();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const pendingTickets = kitchenTickets.filter(t => t.status === 'pending');
  const preparingTickets = kitchenTickets.filter(t => t.status === 'preparing');
  const readyTickets = kitchenTickets.filter(t => t.status === 'ready');

  const handleStartCooking = (ticketId: string) => {
    updateKitchenTicket(ticketId, 'preparing');
    toast.success('Started preparing order');
  };

  const handleMarkItemReady = (ticketId: string, itemId: string, orderId: string) => {
    updateOrderItemStatus(orderId, itemId, 'ready');
    toast.success('Item marked as ready');
  };

  const handleMarkTicketReady = (ticketId: string) => {
    updateKitchenTicket(ticketId, 'ready');
    toast.success('Order ready for pickup!');
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' 
      ? 'border-red-400 bg-red-50' 
      : 'border-orange-200 bg-white';
  };

  const getTimeSince = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    return minutes;
  };

  const TicketCard: React.FC<{ ticket: KitchenTicket; showActions?: boolean }> = ({ 
    ticket, 
    showActions = true 
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
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Table {ticket.tableNumber}</h3>
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

        {/* Items */}
        <div className="space-y-2 mb-4">
          {ticket.items.map(item => {
            const isItemReady = item.status === 'ready';
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
                      if (!isItemReady) {
                        handleMarkItemReady(ticket.id, item.id, ticket.orderId);
                      }
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
                  <p className="text-xs text-gray-500 mt-1">
                    Prep time: {item.menuItem.prepTime} min
                  </p>
                </div>

                {isItemReady && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Ready
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {showActions && (
          <div>
            {ticket.status === 'pending' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartCooking(ticket.id);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Start Cooking
              </button>
            )}
            
            {ticket.status === 'preparing' && (
              <div>
                <div className="text-sm text-gray-600 mb-2 text-center">
                  {ticket.items.filter(i => i.status === 'ready').length} / {ticket.items.length} items ready
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkTicketReady(ticket.id);
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

        {/* Estimated Time */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
          <span className="text-gray-600">Est. completion:</span>
          <span className="font-medium text-gray-900">{ticket.estimatedTime} min</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ChefHat className="size-10 text-orange-500" />
            Kitchen Display System
          </h1>
          <p className="text-gray-600">Manage incoming orders and food preparation</p>
        </div>

        {/* Stats */}
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

        {/* Tickets Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending */}
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
                pendingTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))
              )}
            </div>
          </div>

          {/* Preparing */}
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
                preparingTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))
              )}
            </div>
          </div>

          {/* Ready */}
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
                readyTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} showActions={false} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
