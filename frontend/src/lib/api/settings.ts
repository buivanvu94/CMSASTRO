import { apiClient } from './client';

export interface Setting {
  id: number;
  key: string;
  value: string | null;
  group: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsData {
  settings: Array<{
    key: string;
    value: string;
    group?: string;
  }>;
}

const settingsApi = {
  /**
   * Get all settings
   */
  async getAll(): Promise<Setting[]> {
    const response = await apiClient.get('/settings');
    return response.data.data;
  },

  /**
   * Get setting by key
   */
  async getByKey(key: string): Promise<Setting> {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data.data;
  },

  /**
   * Get settings by group
   */
  async getByGroup(group: string): Promise<Setting[]> {
    const response = await apiClient.get(`/settings/group/${group}`);
    return response.data.data;
  },

  /**
   * Update settings (upsert)
   */
  async update(data: UpdateSettingsData): Promise<Setting[]> {
    const response = await apiClient.put('/settings', data);
    return response.data.data;
  },
};

export default settingsApi;
