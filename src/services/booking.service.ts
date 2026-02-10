import api from '@/lib/axios';
import type React from 'react';

export interface RoomBooking {
  id: number;
  document_id: number;
  room_id: number;
  booked_by: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  special_requirements?: string;
  expected_participants?: number;
  created_at: string;
  updated_at: string;
  room?: {
    id: number;
    name: string;
    capacity: number;
  };
  document?: {
    id: number;
    title: string;
    status: string;
  };
  booked_by_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BookingFilters {
  document_id?: number;
  room_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  my_bookings?: boolean;
  my_unit_bookings?: boolean;
}

export interface BookingResponse {
  success: boolean;
  data: RoomBooking[];
}

export interface SingleBookingResponse {
  success: boolean;
  data: RoomBooking;
}

export const bookingService = {
  /**
   * Get list of room bookings with optional filters
   */
  async getBookings(filters?: BookingFilters): Promise<RoomBooking[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<BookingResponse>(
      `/room-bookings${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data.data;
  },

  /**
   * Get single booking detail
   */
  async getBooking(id: number): Promise<RoomBooking> {
    const response = await api.get<SingleBookingResponse>(
      `/room-bookings/${id}`,
    );
    return response.data.data;
  },

  /**
   * Check if document already has a room booking
   */
  async getBookingByDocumentId(
    documentId: number,
  ): Promise<RoomBooking | null> {
    try {
      const bookings = await this.getBookings({ document_id: documentId });
      return bookings.length > 0 ? bookings[0] : null;
    } catch (error) {
      console.error('Error checking document booking:', error);
      return null;
    }
  },

  /**
   * Create new room booking
   */
  async createBooking(data: {
    document_id: number;
    room_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    special_requirements?: string;
    expected_participants?: number;
  }): Promise<RoomBooking> {
    const response = await api.post<SingleBookingResponse>(
      '/room-bookings',
      data,
    );
    return response.data.data;
  },

  /**
   * Update existing booking (only pending bookings)
   */
  async updateBooking(
    id: number,
    data: Partial<RoomBooking>,
  ): Promise<RoomBooking> {
    const response = await api.put<SingleBookingResponse>(
      `/room-bookings/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete booking (soft delete)
   */
  async deleteBooking(id: number): Promise<void> {
    await api.delete(`/room-bookings/${id}`);
  },

  /**
   * Approve booking
   */
  async approveBooking(id: number): Promise<RoomBooking> {
    const response = await api.post<SingleBookingResponse>(
      `/room-bookings/${id}/approve`,
    );
    return response.data.data;
  },

  /**
   * Reject booking
   */
  async rejectBooking(id: number, reason: string): Promise<RoomBooking> {
    const response = await api.post<SingleBookingResponse>(
      `/room-bookings/${id}/reject`,
      {
        rejection_reason: reason,
      },
    );
    return response.data.data;
  },

  /**
   * Cancel booking
   */
  async cancelBooking(id: number): Promise<RoomBooking> {
    const response = await api.post<SingleBookingResponse>(
      `/room-bookings/${id}/cancel`,
    );
    return response.data.data;
  },

  /**
   * Complete booking
   */
  async completeBooking(id: number): Promise<RoomBooking> {
    const response = await api.post<SingleBookingResponse>(
      `/room-bookings/${id}/complete`,
    );
    return response.data.data;
  },

  /**
   * Get booking statistics
   */
  async getStatistics(): Promise<React.ReactNode> {
    const response = await api.get('/room-bookings/statistics');
    return response.data.data;
  },
};
