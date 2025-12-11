import { create } from 'zustand';
import type { Task, TaskFilters, TaskStats } from '../types';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  stats: TaskStats | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: TaskFilters) => void;
  setStats: (stats: TaskStats) => void;

  // Computed
  filteredTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filters: {},
  stats: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({
    tasks: [...(state.tasks || []), task]
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: (state.tasks || []).map(task =>
      task.id === id ? { ...task, ...updates } : task
    )
  })),

  deleteTask: (id) => set((state) => ({
    tasks: (state.tasks || []).filter(task => task.id !== id)
  })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => set({ filters }),

  setStats: (stats) => set({ stats }),

  filteredTasks: () => {
    const { tasks, filters } = get();
    const safeTasks = tasks || [];
    return safeTasks.filter(task => {
      if (filters.completed !== undefined && task.completed !== filters.completed) {
        return false;
      }
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      if (filters.assigned_to && task.assigned_to !== filters.assigned_to) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
               task.description.toLowerCase().includes(searchLower);
      }
      return true;
    });
  },
}));