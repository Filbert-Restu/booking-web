import api from '@/lib/axios';
import type { PaginatedData } from '@/types/pagination';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  unit_id: number;
  status?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
  unit?: {
    id: number;
    name: string;
    code: string;
    category: string;
  };
}

export interface UserResponse {
  success: boolean;
  data: PaginatedData<User>;
}

export interface SingleUserResponse {
  success: boolean;
  data: User;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role_id: number;
  unit_id: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role_id?: number;
  unit_id?: number;
}

export const userService = {
  /**
   * Get all users
   */
  async getUsers(params?: {
    role_id?: number;
    unit_id?: number;
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<User[]> {
    const response = await api.get<UserResponse>('/users', { params });
    // Laravel Paginator returns data inside a 'data' property
    return response.data.data.data;
  },

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<User> {
    const response = await api.get<SingleUserResponse>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post<SingleUserResponse>('/users', data);
    return response.data.data;
  },

  /**
   * Update user
   */
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await api.put<SingleUserResponse>(`/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
