// Menu Service
import api from './api';
import { MenuItem } from '../types';

// Backend DTO
interface MenuItemResponse {
  id: number;
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number;
  createdAt: string;
  updatedAt: string;
}

// Map backend menu item to frontend
const mapMenuItem = (backendItem: MenuItemResponse): MenuItem => {
  return {
    id: backendItem.id.toString(),
    name: backendItem.name,
    category: backendItem.category,
    price: backendItem.price,
    description: backendItem.description,
    image: backendItem.imageUrl,
    available: backendItem.isAvailable,
    prepTime: backendItem.preparationTime || 0,
  };
};

export const menuService = {
  // Get all menu items
  async getMenuItems(category?: string, available?: boolean): Promise<MenuItem[]> {
    const params: any = {};
    if (category) params.category = category;
    if (available !== undefined) params.available = available;
    
    const response = await api.get<MenuItemResponse[]>('/menu-items', { params });
    const data = (response as any).data || response;
    const items = Array.isArray(data) ? data : [];
    return items.map(mapMenuItem);
  },

  // Get menu item by ID
  async getMenuItemById(id: string): Promise<MenuItem> {
    const response = await api.get<MenuItemResponse>(`/menu-items/${id}`);
    const data = (response as any).data || response;
    return mapMenuItem(data);
  },

  // Update menu item availability (Manager/Admin only)
  async updateAvailability(id: string, available: boolean): Promise<MenuItem> {
    const response = await api.patch<MenuItemResponse>(
      `/menu-items/${id}/availability`,
      null,
      { params: { available } }
    );
    const data = (response as any).data || response;
    return mapMenuItem(data);
  },
};
