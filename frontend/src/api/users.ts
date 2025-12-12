import { api } from './client';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  password?: string;
  role?: string;
  is_active?: boolean;
}

export interface DeleteUserResponse {
  message: string;
}

// Get all users
export const getUsers = async () => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

// Get single user by ID
export const getUserById = async (userId: number) => {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
};

// Update user
export const updateUser = async (userId: number, userData: UpdateUserData) => {
  const response = await api.put<User>(`/users/${userId}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (userId: number) => {
  const response = await api.delete<DeleteUserResponse>(`/users/${userId}`);
  return response.data;
};
