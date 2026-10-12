import api from './api';
import { CreateUserDto, UpdateUserDto, User } from '../types';

const LOCAL_USERS_KEY = 'affan_local_users';

const getInitialSeedUsers = (): User[] => [
  {
    id: 1,
    name: 'Super Admin',
    email: 'admin@affanstore.com',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Tester Pelanggan',
    email: 'tester@example.com',
    role: 'USER',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Budi Santoso',
    email: 'budi@example.com',
    role: 'USER',
    createdAt: new Date().toISOString(),
  },
];

export const getLocalUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_USERS_KEY);
  if (!stored) {
    const seeds = getInitialSeedUsers();
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(seeds));
    return seeds;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return getInitialSeedUsers();
  }
};

export const saveLocalUsers = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  }
};

export const userService = {
  async getAllUsers(): Promise<User[]> {
    let apiUsers: User[] = [];
    try {
      const response = await api.get<User[]>('/users');
      apiUsers = response.data || [];
    } catch {
      apiUsers = [];
    }

    const localUsers = getLocalUsers();
    const combined: User[] = [...localUsers];
    apiUsers.forEach((u) => {
      if (!combined.some((lu) => lu.id === u.id)) {
        combined.push(u);
      }
    });

    return combined;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const response = await api.post<User>('/users', data);
      return response.data;
    } catch {
      const localUsers = getLocalUsers();
      const newUser: User = {
        id: Math.floor(10 + Math.random() * 90),
        name: data.name,
        email: data.email,
        role: data.role || 'USER',
        createdAt: new Date().toISOString(),
      };
      localUsers.push(newUser);
      saveLocalUsers(localUsers);
      return newUser;
    }
  },

  async getUserById(id: number | string): Promise<User> {
    const numId = Number(id);
    const local = getLocalUsers().find((u) => u.id === numId);
    if (local) return local;

    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (err) {
      if (local) return local;
      throw err;
    }
  },

  async updateUser(id: number | string, data: UpdateUserDto): Promise<User> {
    const numId = Number(id);
    const localUsers = getLocalUsers();
    const local = localUsers.find((u) => u.id === numId);

    if (local) {
      if (data.name) local.name = data.name;
      if (data.email) local.email = data.email;
      if (data.role) local.role = data.role;
      saveLocalUsers(localUsers);
    }

    try {
      const response = await api.patch<User>(`/users/${id}`, data);
      return response.data;
    } catch {
      if (local) return local;
      throw new Error('Gagal memperbarui pengguna');
    }
  },

  async deleteUser(id: number | string): Promise<{ success: boolean; message?: string }> {
    const numId = Number(id);
    const localUsers = getLocalUsers();
    const filtered = localUsers.filter((u) => u.id !== numId);
    saveLocalUsers(filtered);

    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch {
      return { success: true, message: 'Pengguna berhasil dihapus' };
    }
  },
};

