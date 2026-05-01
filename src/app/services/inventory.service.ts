import api from './api';
import { InventoryItem } from '../types';

interface InventoryItemResponse {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
  updatedAt?: string;
}

const mapInventoryItem = (item: InventoryItemResponse): InventoryItem => ({
  id: item.id.toString(),
  name: item.name,
  category: item.category,
  quantity: Number(item.quantity || 0),
  unit: item.unit,
  minStock: Number(item.threshold || 0),
  lastRestocked: item.updatedAt ? new Date(item.updatedAt) : new Date(),
});

export const inventoryService = {
  async getInventory(category?: string): Promise<InventoryItem[]> {
    const response = await api.get<InventoryItemResponse[]>('/inventory-items', {
      params: category ? { category } : {},
    });
    const data = (response as any).data || response;
    return (Array.isArray(data) ? data : []).map(mapInventoryItem);
  },
};
