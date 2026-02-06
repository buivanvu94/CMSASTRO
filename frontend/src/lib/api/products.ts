import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface ProductPrice {
  id: number;
  product_id: number;
  variant_name: string | null;
  price: number;
  sale_price: number | null;
  is_default: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  product_category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  featured_image_id: number | null;
  gallery: number[] | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  featuredImage?: {
    id: number;
    filename: string;
    path: string;
    thumbnail_path: string | null;
  };
  prices?: ProductPrice[];
}

export interface CreateProductData {
  product_category_id?: number | null;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  featured_image_id?: number | null;
  gallery?: number[];
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  sort_order?: number;
  seo_title?: string;
  seo_description?: string;
  prices?: Array<{
    variant_name?: string;
    price: number;
    sale_price?: number;
    is_default?: boolean;
    status?: 'active' | 'inactive';
  }>;
}

export interface UpdateProductData {
  product_category_id?: number | null;
  name?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  featured_image_id?: number | null;
  gallery?: number[];
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  sort_order?: number;
  seo_title?: string;
  seo_description?: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  productCategoryId?: number;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
}

export interface CreatePriceData {
  variant_name?: string;
  price: number;
  sale_price?: number;
  is_default?: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdatePriceData {
  variant_name?: string;
  price?: number;
  sale_price?: number;
  is_default?: boolean;
  status?: 'active' | 'inactive';
}

const productsApi = {
  /**
   * Get list of products with pagination
   */
  async getAll(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  /**
   * Get product by ID
   */
  async getById(id: number): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data;
  },

  /**
   * Get product by slug
   */
  async getBySlug(slug: string): Promise<Product> {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data.data;
  },

  /**
   * Create new product
   */
  async create(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post('/products', data);
    return response.data.data;
  },

  /**
   * Update product
   */
  async update(id: number, data: UpdateProductData): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete product
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  /**
   * Add price variant to product
   */
  async addPrice(productId: number, data: CreatePriceData): Promise<ProductPrice> {
    const response = await apiClient.post(`/products/${productId}/prices`, data);
    return response.data.data;
  },

  /**
   * Update price variant
   */
  async updatePrice(productId: number, priceId: number, data: UpdatePriceData): Promise<ProductPrice> {
    const response = await apiClient.put(`/products/${productId}/prices/${priceId}`, data);
    return response.data.data;
  },

  /**
   * Delete price variant
   */
  async deletePrice(productId: number, priceId: number): Promise<void> {
    await apiClient.delete(`/products/${productId}/prices/${priceId}`);
  },
};

export default productsApi;
