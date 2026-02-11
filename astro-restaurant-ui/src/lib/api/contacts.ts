import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'spam';
  source: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContactData {
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  source?: string;
}

export interface ContactListParams {
  page?: number;
  limit?: number;
  status?: 'new' | 'read' | 'replied' | 'spam';
  search?: string;
}

export interface UpdateStatusData {
  status: 'new' | 'read' | 'replied' | 'spam';
}

export interface BulkDeleteData {
  ids: number[];
}

const contactsApi = {
  /**
   * Get list of contacts with pagination
   */
  async getAll(params?: ContactListParams): Promise<PaginatedResponse<Contact>> {
    const response = await apiClient.get('/contacts', { params });
    return response.data;
  },

  /**
   * Get contact by ID
   */
  async getById(id: number): Promise<Contact> {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data.data;
  },

  /**
   * Submit contact form (public endpoint)
   */
  async create(data: CreateContactData): Promise<Contact> {
    const response = await apiClient.post('/contacts', data);
    return response.data.data;
  },

  /**
   * Update contact status
   */
  async updateStatus(id: number, data: UpdateStatusData): Promise<Contact> {
    const response = await apiClient.put(`/contacts/${id}/status`, data);
    return response.data.data;
  },

  /**
   * Delete contact
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/contacts/${id}`);
  },

  /**
   * Bulk delete contacts
   */
  async bulkDelete(data: BulkDeleteData): Promise<void> {
    await apiClient.delete('/contacts/bulk', { data });
  },
};

export default contactsApi;
