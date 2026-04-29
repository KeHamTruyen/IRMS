import api from './api';
import { InventoryItem } from '../types';

interface InventoryItemResponse {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  lastRestocked: string;
}

const mapInventoryItem = (backendItem: InventoryItemResponse): InventoryItem => {
  return {
    id: backendItem.id.toString(),
    name: backendItem.name,
    category: backendItem.category,
    quantity: backendItem.quantity,
    unit: backendItem.unit,
    minStock: backendItem.minStock,
    lastRestocked: new Date(backendItem.lastRestocked),
  };
};

export const inventoryService = {
  async getInventory(category?: string, lowStock?: boolean): Promise<InventoryItem[]> {
    const params: Record<string, string | boolean> = {};
    if (category) params.category = category;
    if (lowStock !== undefined) params.lowStock = lowStock;

    const response = await api.get<InventoryItemResponse[]>('/inventory', { params });
    const data = (response as any).data || response;
    const items = Array.isArray(data) ? data : [];

    return items.map(mapInventoryItem);
  },

  async updateQuantity(id: string, quantity: number): Promise<InventoryItem> {
    const response = await api.patch<InventoryItemResponse>(`/inventory/${id}/quantity`, { quantity });
    const data = (response as any).data || response;
    return mapInventoryItem(data);
  },
};
