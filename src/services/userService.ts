import api from './api';
import { CreateUserDto, UpdateUserDto, User } from '../types';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  async getUserById(id: number | string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async updateUser(id: number | string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number | string): Promise<{ success: boolean; message?: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
