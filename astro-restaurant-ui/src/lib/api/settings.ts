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

export interface BookingEmailTemplates {
  customerBookingCreated: {
    subject: string;
    body: string;
  };
  adminBookingCreated: {
    subject: string;
    body: string;
  };
  customerBookingReminder: {
    subject: string;
    body: string;
  };
}

export interface BookingEmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpFrom: string;
  smtpReplyTo: string;
  smtpHasPassword: boolean;
  adminBookingNotificationEnabled: boolean;
  adminBookingNotificationEmails: string[];
  reminderEnabled: boolean;
  reminderLeadHours: number;
  emailTemplates: BookingEmailTemplates;
}

export interface UpdateBookingEmailConfigData {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  smtpReplyTo?: string;
  adminBookingNotificationEnabled?: boolean;
  adminBookingNotificationEmails?: string[] | string;
  reminderEnabled?: boolean;
  reminderLeadHours?: number;
  emailTemplates?: Partial<BookingEmailTemplates>;
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

  async getBookingEmailConfig(): Promise<BookingEmailConfig> {
    const response = await apiClient.get('/settings/booking-email');
    return response.data.data;
  },

  async updateBookingEmailConfig(data: UpdateBookingEmailConfigData): Promise<BookingEmailConfig> {
    const response = await apiClient.put('/settings/booking-email', data);
    return response.data.data;
  },

  async testBookingEmailConfig(testTo: string): Promise<{ sent: boolean; reason?: string; message?: string }> {
    const response = await apiClient.post('/settings/booking-email/test', { testTo });
    return response.data.data;
  },
};

export default settingsApi;
