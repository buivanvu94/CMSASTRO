import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface Reservation {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests: string | null;
  handler_id: number | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes: string | null;
  created_at: string;
  updated_at: string;
  handler?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface CreateReservationData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
}

export interface UpdateReservationData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  party_size?: number;
  reservation_date?: string;
  reservation_time?: string;
  special_requests?: string;
  handler_id?: number;
  notes?: string;
}

export interface ReservationListParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateStatusData {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  note?: string;
}

export interface CalendarData {
  [date: string]: Reservation[];
}

const reservationsApi = {
  /**
   * Get list of reservations with pagination
   */
  async getAll(params?: ReservationListParams): Promise<PaginatedResponse<Reservation>> {
    const response = await apiClient.get('/reservations', { params });
    return response.data;
  },

  /**
   * Get reservation by ID
   */
  async getById(id: number): Promise<Reservation> {
    const response = await apiClient.get(`/reservations/${id}`);
    return response.data.data;
  },

  /**
   * Create new reservation (public endpoint)
   */
  async create(data: CreateReservationData): Promise<Reservation> {
    const response = await apiClient.post('/reservations', data);
    return response.data.data;
  },

  /**
   * Update reservation
   */
  async update(id: number, data: UpdateReservationData): Promise<Reservation> {
    const response = await apiClient.put(`/reservations/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete reservation
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/reservations/${id}`);
  },

  /**
   * Update reservation status
   */
  async updateStatus(id: number, data: UpdateStatusData): Promise<Reservation> {
    const response = await apiClient.put(`/reservations/${id}/status`, data);
    return response.data.data;
  },

  /**
   * Get calendar view of reservations
   */
  async getCalendar(year?: number, month?: number): Promise<CalendarData> {
    const response = await apiClient.get('/reservations/calendar', {
      params: { year, month },
    });
    return response.data.data;
  },
};

export default reservationsApi;
