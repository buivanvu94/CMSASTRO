import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface Post {
  id: number;
  category_id: number | null;
  author_id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image_id: number | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  view_count: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    id: number;
    full_name: string;
    email: string;
  };
  featuredImage?: {
    id: number;
    filename: string;
    path: string;
    thumbnail_path: string | null;
  };
}

export interface CreatePostData {
  category_id?: number | null;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featured_image_id?: number | null;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdatePostData {
  category_id?: number | null;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featured_image_id?: number | null;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface PostListParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  author_id?: number;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
}

export interface UpdateStatusData {
  status: 'draft' | 'published' | 'archived';
}

const postsApi = {
  /**
   * Get list of posts with pagination
   */
  async getAll(params?: PostListParams): Promise<PaginatedResponse<Post>> {
    const response = await apiClient.get('/posts', { params });
    return response.data;
  },

  /**
   * Get post by ID
   */
  async getById(id: number): Promise<Post> {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data.data;
  },

  /**
   * Get post by slug
   */
  async getBySlug(slug: string): Promise<Post> {
    const response = await apiClient.get(`/posts/slug/${slug}`);
    return response.data.data;
  },

  /**
   * Create new post
   */
  async create(data: CreatePostData): Promise<Post> {
    const response = await apiClient.post('/posts', data);
    return response.data.data;
  },

  /**
   * Update post
   */
  async update(id: number, data: UpdatePostData): Promise<Post> {
    const response = await apiClient.put(`/posts/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete post
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },

  /**
   * Update post status
   */
  async updateStatus(id: number, data: UpdateStatusData): Promise<Post> {
    const response = await apiClient.put(`/posts/${id}/status`, data);
    return response.data.data;
  },
};

export default postsApi;
