export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  created_by: number;
  assigned_to: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface TaskFilters {
  completed?: boolean;
  priority?: string;
  assigned_to?: number;
  search?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface Comment {
  id: number;
  content: string;
  task_id: number;
  user_id: number;
  created_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface CreateCommentData {
  content: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  // assigned_to: number;
}