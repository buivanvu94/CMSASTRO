import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface Media {
  id: number;
  uploaded_by: number | null;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  thumbnail_path: string | null;
  alt_text: string | null;
  caption: string | null;
  folder: string;
  created_at: string;
  updated_at: string;
  uploader?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface MediaListParams {
  page?: number;
  limit?: number;
  search?: string;
  folder?: string;
  mime_type?: string;
}

export interface UpdateMediaData {
  alt_text?: string;
  caption?: string;
  folder?: string;
}

export interface CreateFolderData {
  name: string;
}

export interface BulkDeleteData {
  ids: number[];
}

const mediaApi = {
  /**
   * Get list of media with pagination
   */
  async getAll(params?: MediaListParams): Promise<PaginatedResponse<Media>> {
    const response = await apiClient.get('/media', { params });
    return response.data;
  },

  /**
   * Get media by ID
   */
  async getById(id: number): Promise<Media> {
    const response = await apiClient.get(`/media/${id}`);
    return response.data.data;
  },

  /**
   * Upload single file
   */
  async upload(file: File, folder?: string): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: File[], folder?: string): Promise<Media[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post('/media/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Update media metadata
   */
  async update(id: number, data: UpdateMediaData): Promise<Media> {
    const response = await apiClient.put(`/media/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete media
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/media/${id}`);
  },

  /**
   * Bulk delete media
   */
  async bulkDelete(data: BulkDeleteData): Promise<void> {
    await apiClient.delete('/media/bulk', { data });
  },

  /**
   * Get list of folders
   */
  async getFolders(): Promise<string[]> {
    const response = await apiClient.get('/media/folders');
    return response.data.data;
  },

  /**
   * Create folder
   */
  async createFolder(data: CreateFolderData): Promise<void> {
    await apiClient.post('/media/folders', data);
  },
};

export default mediaApi;
