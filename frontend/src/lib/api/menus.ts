import { apiClient } from './client';

export interface MenuItem {
  id: number;
  menu_id: number;
  parent_id: number | null;
  title: string;
  url: string | null;
  target: '_self' | '_blank';
  icon: string | null;
  linkable_type: string | null;
  linkable_id: number | null;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  items?: MenuItem[];
}

export interface CreateMenuData {
  name: string;
  location: string;
  status?: 'active' | 'inactive';
}

export interface UpdateMenuData {
  name?: string;
  location?: string;
  status?: 'active' | 'inactive';
}

export interface CreateMenuItemData {
  parent_id?: number | null;
  title: string;
  url?: string;
  target?: '_self' | '_blank';
  icon?: string;
  linkable_type?: string;
  linkable_id?: number;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateMenuItemData {
  parent_id?: number | null;
  title?: string;
  url?: string;
  target?: '_self' | '_blank';
  icon?: string;
  linkable_type?: string;
  linkable_id?: number;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export interface ReorderItemsData {
  items: Array<{ id: number; sort_order: number; parent_id?: number | null }>;
}

const menusApi = {
  /**
   * Get list of menus
   */
  async getAll(): Promise<Menu[]> {
    const response = await apiClient.get('/menus');
    return response.data.data;
  },

  /**
   * Get menu by ID with items
   */
  async getById(id: number): Promise<Menu> {
    const response = await apiClient.get(`/menus/${id}`);
    return response.data.data;
  },

  /**
   * Get menu by location with nested items
   */
  async getByLocation(location: string): Promise<Menu> {
    const response = await apiClient.get(`/menus/location/${location}`);
    return response.data.data;
  },

  /**
   * Create new menu
   */
  async create(data: CreateMenuData): Promise<Menu> {
    const response = await apiClient.post('/menus', data);
    return response.data.data;
  },

  /**
   * Update menu
   */
  async update(id: number, data: UpdateMenuData): Promise<Menu> {
    const response = await apiClient.put(`/menus/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete menu
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/menus/${id}`);
  },

  /**
   * Add menu item
   */
  async addItem(menuId: number, data: CreateMenuItemData): Promise<MenuItem> {
    const response = await apiClient.post(`/menus/${menuId}/items`, data);
    return response.data.data;
  },

  /**
   * Update menu item
   */
  async updateItem(menuId: number, itemId: number, data: UpdateMenuItemData): Promise<MenuItem> {
    const response = await apiClient.put(`/menus/${menuId}/items/${itemId}`, data);
    return response.data.data;
  },

  /**
   * Delete menu item
   */
  async deleteItem(menuId: number, itemId: number): Promise<void> {
    await apiClient.delete(`/menus/${menuId}/items/${itemId}`);
  },

  /**
   * Reorder menu items
   */
  async reorderItems(menuId: number, data: ReorderItemsData): Promise<void> {
    await apiClient.put(`/menus/${menuId}/items/reorder`, data);
  },
};

export default menusApi;
