import { create } from 'zustand';
import type { Comment } from '../types';

interface CommentsStore {
  comments: Record<number, Comment[]>; // taskId -> comments array
  loading: Record<number, boolean>; // taskId -> loading state
  error: Record<number, string | null>; // taskId -> error message

  // Actions
  setComments: (taskId: number, comments: Comment[]) => void;
  addComment: (taskId: number, comment: Comment) => void;
  removeComment: (taskId: number, commentId: number) => void;
  setLoading: (taskId: number, loading: boolean) => void;
  setError: (taskId: number, error: string | null) => void;
  clearComments: (taskId: number) => void;
}

export const useCommentsStore = create<CommentsStore>((set, get) => ({
  comments: {},
  loading: {},
  error: {},

  setComments: (taskId, comments) => set((state) => ({
    comments: { ...state.comments, [taskId]: comments }
  })),

  addComment: (taskId, comment) => set((state) => ({
    comments: {
      ...state.comments,
      [taskId]: [...(state.comments[taskId] || []), comment]
    }
  })),

  removeComment: (taskId, commentId) => set((state) => ({
    comments: {
      ...state.comments,
      [taskId]: (state.comments[taskId] || []).filter(c => c.id !== commentId)
    }
  })),

  setLoading: (taskId, loading) => set((state) => ({
    loading: { ...state.loading, [taskId]: loading }
  })),

  setError: (taskId, error) => set((state) => ({
    error: { ...state.error, [taskId]: error }
  })),

  clearComments: (taskId) => set((state) => {
    const newComments = { ...state.comments };
    const newLoading = { ...state.loading };
    const newError = { ...state.error };

    delete newComments[taskId];
    delete newLoading[taskId];
    delete newError[taskId];

    return {
      comments: newComments,
      loading: newLoading,
      error: newError,
    };
  }),
}));