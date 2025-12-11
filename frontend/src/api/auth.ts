import { api } from './client';
import type { User } from '../types';

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  role: 'regular' | 'admin';
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: 'regular' | 'admin';
    is_active: boolean;
  };
}

export interface RegisterResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export const authApi = {
  // Register a new user
  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout (client-side only, token is removed)
  logout: async (): Promise<void> => {
    // In a real app, you might want to call a logout endpoint
    // For now, we just remove the token client-side
    localStorage.removeItem('auth-storage');
  },
};