import React, { useState } from 'react';
import { useRestaurant } from '../../store/RestaurantContext';
import { Table, MenuItem, OrderItem, Order } from '../../types';
import { X, Plus, Minus, ShoppingCart, Send } from 'lucide-react';
import { toast } from 'sonner';

interface TakeOrderModalProps {
  table: Table;
  onClose: () => void;
}

export const TakeOrderModal: React.FC<TakeOrderModalProps> = ({ table, onClose }) => {
  const { menuItems, orders, addOrder, currentUser } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<Map<string, { item: MenuItem; quantity: number; notes: string }>>(new Map());

  const existingOrder = orders.find(o => o.tableId === table.id && o.status !== 'served');

  const categories = ['All', ...Array.from(new Set(menuItems.map(m => m.category)))];

  const filteredMenu = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(m => m.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    if (!item.available) return;
    
    const newCart = new Map(cart);
    const existing = newCart.get(item.id);
    
    if (existing) {
      newCart.set(item.id, { ...existing, quantity: existing.quantity + 1 });
    } else {
      newCart.set(item.id, { item, quantity: 1, notes: '' });
    }
    
    setCart(newCart);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const newCart = new Map(cart);
    const existing = newCart.get(itemId);
    
    if (existing) {
      const newQuantity = existing.quantity + delta;
      if (newQuantity <= 0) {
        newCart.delete(itemId);
      } else {
        newCart.set(itemId, { ...existing, quantity: newQuantity });
      }
    }
    
    setCart(newCart);
  };

  const updateNotes = (itemId: string, notes: string) => {
    const newCart = new Map(cart);
    const existing = newCart.get(itemId);
    
    if (existing) {
      newCart.set(itemId, { ...existing, notes });
    }
    
    setCart(newCart);
  };

  const calculateTotal = () => {
    let total = 0;
    cart.forEach(({ item, quantity }) => {
      total += item.price * quantity;
    });
    return total;
  };

  const handleSubmitOrder = () => {
    if (cart.size === 0) {
      toast.error('Please add items to cart');
      return;
    }

    const orderItems: OrderItem[] = Array.from(cart.values()).map(({ item, quantity, notes }) => ({
      id: `oi${Date.now()}_${item.id}`,
      menuItem: item,
      quantity,
      notes: notes || undefined,
      status: 'pending',
    }));

    const newOrder: Order = {
      id: `o${Date.now()}`,
      tableId: table.id,
      items: orderItems,
      status: 'pending',
      serverId: currentUser?.id || '1',
      serverName: currentUser?.name || 'Server',
      createdAt: new Date(),
      updatedAt: new Date(),
      totalAmount: calculateTotal(),
    };

    addOrder(newOrder);
    toast.success(`Order placed for Table ${table.number}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {existingOrder ? 'Add to Order' : 'New Order'} - Table {table.number}
            </h2>
            <p className="text-sm text-gray-600">Capacity: {table.capacity} guests</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Menu Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Category Tabs */}
            <div className="px-6 py-4 border-b border-gray-200 overflow-x-auto">
              <div className="flex gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMenu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={!item.available}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      item.available
                        ? 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                        : 'border-gray-100 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      {!item.available && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          Out
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-500">${item.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{item.prepTime} min</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="w-96 border-l border-gray-200 flex flex-col bg-gray-50">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-900">
                <ShoppingCart className="size-5" />
                <h3 className="font-bold">Order Cart ({cart.size})</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.size === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingCart className="size-12 mb-2" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(cart.entries()).map(([itemId, { item, quantity, notes }]) => (
                    <div key={itemId} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                          <p className="text-sm text-orange-500">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(itemId, -1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(itemId, 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Special notes..."
                        value={notes}
                        onChange={(e) => updateNotes(itemId, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      
                      <div className="mt-2 text-right text-sm font-medium text-gray-700">
                        ${(item.price * quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
              </div>
              
              <button
                onClick={handleSubmitOrder}
                disabled={cart.size === 0}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="size-5" />
                Send to Kitchen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
