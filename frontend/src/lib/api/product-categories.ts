import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface ProductCategory {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_id: number | null;
  sort_order: number;
  status: 'active' | 'inactive';
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  parent?: ProductCategory;
  children?: ProductCategory[];
  image?: {
    id: number;
    filename: string;
    path: string;
    thumbnail_path: string | null;
  };
}

export interface CreateProductCategoryData {
  parent_id?: number | null;
  name: string;
  slug?: string;
  description?: string;
  image_id?: number | null;
  sort_order?: number;
  status?: 'active' | 'inactive';
  seo_title?: string;
  seo_description?: string;
}

export interface UpdateProductCategoryData {
  parent_id?: number | null;
  name?: string;
  slug?: string;
  description?: string;
  image_id?: number | null;
  sort_order?: number;
  status?: 'active' | 'inactive';
  seo_title?: string;
  seo_description?: string;
}

export interface ProductCategoryListParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  parent_id?: number | null;
}

export interface ReorderProductCategoryData {
  items: Array<{ id: number; sort_order: number; parent_id?: number | null }>;
}

const productCategoriesApi = {
  async getAll(params?: ProductCategoryListParams): Promise<PaginatedResponse<ProductCategory>> {
    const response = await apiClient.get('/product-categories', { params });
    return response.data;
  },

  async getTree(): Promise<ProductCategory[]> {
    const response = await apiClient.get('/product-categories/tree');
    return response.data.data;
  },

  async getById(id: number): Promise<ProductCategory> {
    const response = await apiClient.get(`/product-categories/${id}`);
    return response.data.data;
  },

  async create(data: CreateProductCategoryData): Promise<ProductCategory> {
    const response = await apiClient.post('/product-categories', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateProductCategoryData): Promise<ProductCategory> {
    const response = await apiClient.put(`/product-categories/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/product-categories/${id}`);
  },

  async reorder(data: ReorderProductCategoryData): Promise<void> {
    await apiClient.put('/product-categories/reorder', data);
  }
};

export default productCategoriesApi;
