import { api } from './client';
import type { Task, TaskFilters, Comment, CreateCommentData, CreateTaskData } from '../types';

export interface TasksResponse {
  items: Task[];
  tasks?: Task[]; // Mantener para compatibilidad
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export const tasksApi = {
  // Get tasks with filters and pagination
  getTasks: async (filters?: TaskFilters, page = 1, limit = 10): Promise<TasksResponse> => {
    const params = new URLSearchParams();
    if (filters?.completed !== undefined) params.append('completed', filters.completed.toString());
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    if (filters?.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`tasks?${params}`);
    return response.data;
  },

  // Get single task
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (task: CreateTaskData): Promise<Task> => {
    const response = await api.post('tasks', task);
    console.log(response);
    return response.data;
  },

  // Update task
  updateTask: async (id: number, updates: Partial<CreateTaskData>): Promise<Task> => {
    const response = await api.put(`tasks/${id}`, updates);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`tasks/${id}`);
  },

  // Get task statistics
  getStats: async (): Promise<TaskStats> => {
    const response = await api.get('tasks/statistics');
    return response.data;
  },

  // Add comment to task
  addComment: async (taskId: number, commentData: CreateCommentData): Promise<Comment> => {
    const response = await api.post(`tasks/${taskId}/comments`, commentData);
    return response.data;
  },

  // Get comments for a task
  getTaskComments: async (taskId: number): Promise<Comment[]> => {
    const response = await api.get(`tasks/${taskId}/comments`);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`comments/${commentId}`);
  },
};