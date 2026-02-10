import api from '@/lib/axios';

export interface Room {
  id: number;
  name: string;
  code: string;
  capacity: number;
  facilities?: string[];
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  description?: string;
  location?: string;
  building?: string;
  floor?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  is_available?: boolean;
}

export interface RoomResponse {
  success: boolean;
  data: Room[];
}

export interface SingleRoomResponse {
  success: boolean;
  data: {
    room: Room;
    upcoming_bookings?: RoomBooking[];
  };
}

export interface RoomBooking {
  id: number;
  document_id: number;
  room_id: number;
  booked_by: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  document?: {
    id: number;
    title: string;
    status: string;
    content?: {
      ketua_pelaksana_nama?: string;
      [key: string]: string | undefined;
    };
  };
  bookedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    available: boolean;
    room: Room;
    date: string;
    start_time: string;
    end_time: string;
    conflicts?: RoomBooking[];
  };
}

export interface ScheduleResponse {
  success: boolean;
  data: {
    room: Room;
    start_date: string;
    end_date: string;
    bookings: RoomBooking[];
  };
}

export const roomService = {
  /**
   * Get list ruangan dengan filter
   */
  async getRooms(filters?: {
    status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
    capacity_min?: number;
    search?: string;
    available_date?: string;
    available_start?: string;
    available_end?: string;
  }): Promise<Room[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<RoomResponse>(
      `/rooms${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data.data;
  },

  /**
   * Get detail ruangan dengan upcoming bookings
   */
  async getRoom(id: number): Promise<SingleRoomResponse['data']> {
    const response = await api.get<SingleRoomResponse>(`/rooms/${id}`);
    return response.data.data;
  },

  /**
   * Cek ketersediaan ruangan pada waktu tertentu
   */
  async checkAvailability(
    roomId: number,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<AvailabilityResponse['data']> {
    const response = await api.post<AvailabilityResponse>(
      `/rooms/${roomId}/check-availability`,
      {
        date,
        start_time: startTime,
        end_time: endTime,
      },
    );
    return response.data.data;
  },

  /**
   * Get jadwal booking ruangan pada range tanggal
   */
  async getRoomSchedule(
    roomId: number,
    startDate: string,
    endDate: string,
  ): Promise<ScheduleResponse['data']> {
    const response = await api.get<ScheduleResponse>(
      `/rooms/${roomId}/schedule?start_date=${startDate}&end_date=${endDate}`,
    );
    return response.data.data;
  },

  /**
   * Create ruangan baru (admin/unit manager)
   */
  async createRoom(data: FormData): Promise<Room> {
    const response = await api.post<{ success: boolean; data: Room }>(
      '/rooms',
      data,
    );
    return response.data.data;
  },

  /**
   * Update ruangan (admin/unit manager)
   */
  async updateRoom(
    id: number,
    data: {
      name?: string;
      code?: string;
      capacity?: number;
      facilities?: string[];
      description?: string;
      images?: string[];
      status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
    },
  ): Promise<Room> {
    const response = await api.put<{ success: boolean; data: Room }>(
      `/rooms/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete ruangan (admin/unit manager)
   */
  async deleteRoom(id: number): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },

  /**
   * Upload foto ruangan (admin/unit manager)
   */
  async uploadImage(
    roomId: number,
    image: File,
  ): Promise<{ path: string; url: string }> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.post<{
      success: boolean;
      data: { path: string; url: string; all_images: string[] };
    }>(`/rooms/${roomId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Hapus foto ruangan (admin/unit manager)
   */
  async deleteImage(roomId: number, path: string): Promise<void> {
    await api.delete(`/rooms/${roomId}/images`, {
      data: { path },
    });
  },
};
