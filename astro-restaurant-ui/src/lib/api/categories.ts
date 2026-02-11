import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_id: number | null;
  type: 'post' | 'product';
  sort_order: number;
  status: 'active' | 'inactive';
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
  image?: {
    id: number;
    filename: string;
    path: string;
    thumbnail_path: string | null;
  };
}

export interface CreateCategoryData {
  parent_id?: number | null;
  name: string;
  slug?: string;
  description?: string;
  image_id?: number | null;
  type?: 'post' | 'product';
  sort_order?: number;
  status?: 'active' | 'inactive';
  seo_title?: string;
  seo_description?: string;
}

export interface UpdateCategoryData {
  parent_id?: number | null;
  name?: string;
  slug?: string;
  description?: string;
  image_id?: number | null;
  type?: 'post' | 'product';
  sort_order?: number;
  status?: 'active' | 'inactive';
  seo_title?: string;
  seo_description?: string;
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  type?: 'post' | 'product';
  status?: 'active' | 'inactive';
  parent_id?: number | null;
}

export interface ReorderData {
  categories: Array<{ id: number; sort_order: number }>;
}

const categoriesApi = {
  /**
   * Get list of categories with pagination
   */
  async getAll(params?: CategoryListParams): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },

  /**
   * Get category tree structure
   */
  async getTree(type?: 'post' | 'product'): Promise<Category[]> {
    const response = await apiClient.get('/categories/tree', {
      params: type ? { type } : undefined,
    });
    return response.data.data;
  },

  /**
   * Get category by ID
   */
  async getById(id: number): Promise<Category> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Create new category
   */
  async create(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post('/categories', data);
    return response.data.data;
  },

  /**
   * Update category
   */
  async update(id: number, data: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete category
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },

  /**
   * Reorder categories
   */
  async reorder(data: ReorderData): Promise<void> {
    await apiClient.put('/categories/reorder', data);
  },
};

export default categoriesApi;
