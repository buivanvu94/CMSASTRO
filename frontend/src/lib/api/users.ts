import { apiClient } from './client';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'editor' | 'author';
  status: 'active' | 'inactive';
  avatar_id: number | null;
  avatar?: {
    id: number;
    filename: string;
    path: string;
    thumbnail_path: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  full_name: string;
  email: string;
  password: string;
  role?: 'admin' | 'editor' | 'author';
  status?: 'active' | 'inactive';
  avatar_id?: number | null;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'editor' | 'author';
  status?: 'active' | 'inactive';
  avatar_id?: number | null;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'editor' | 'author';
  status?: 'active' | 'inactive';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const usersApi = {
  /**
   * Get list of users with pagination
   */
  async getAll(params?: UserListParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<User> {
    const response = await apiClient.post('/users', data);
    return response.data.data;
  },

  /**
   * Update user
   */
  async update(id: number, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete user
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

export default usersApi;
