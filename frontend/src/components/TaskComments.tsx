import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useCommentsStore } from '../stores/commentsStore';
import { tasksApi } from '../api/tasks';
import { useAuthStore } from '../stores/authStore';
import { Loader2, MessageSquare, Send, Trash2 } from 'lucide-react';
import type { Comment } from '../types';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface TaskCommentsProps {
  taskId: number;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuthStore();
  const {
    comments,
    loading,
    error,
    setComments,
    addComment,
    removeComment,
    setLoading,
    setError,
  } = useCommentsStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const taskComments = Array.isArray(comments[taskId]) ? comments[taskId] : [];
  const isLoading = loading[taskId] || false;
  const commentError = error[taskId];

  useEffect(() => {
    if (showComments && taskComments.length === 0 && !isLoading) {
      loadComments();
    }
  }, [showComments, taskId]);

  const loadComments = async () => {
    setLoading(taskId, true);
    setError(taskId, null);
    try {
      const response: any = await tasksApi.getTaskComments(taskId);
      // Handle both array response and object with items
      const fetchedComments = Array.isArray(response) 
        ? response 
        : (response?.items || response?.comments || []);
      setComments(taskId, fetchedComments);
    } catch (err: any) {
      setError(taskId, err.response?.data?.detail || 'Failed to load comments');
    } finally {
      setLoading(taskId, false);
    }
  };

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      const newComment = await tasksApi.addComment(taskId, { content: data.content });
      addComment(taskId, newComment);
      reset();
    } catch (err: any) {
      setError(taskId, err.response?.data?.detail || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await tasksApi.deleteComment(commentId);
      removeComment(taskId, commentId);
    } catch (err: any) {
      setError(taskId, err.response?.data?.detail || 'Failed to delete comment');
    }
  };

  const canDeleteComment = (comment: Comment) => {
    return user && (user.id === comment.user_id || user.role === 'admin');
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setShowComments(!showComments)}
        className="w-full"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Comments ({taskComments.length})
      </Button>

      {showComments && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add comment form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Add a comment..."
                  {...register('content')}
                  disabled={isSubmitting}
                />
                {errors.content && (
                  <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting} size="sm">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Error display */}
            {commentError && (
              <Alert variant="destructive">
                <AlertDescription>{commentError}</AlertDescription>
              </Alert>
            )}

            {/* Comments list */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : taskComments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                taskComments.map((comment) => {
                  // Determinar el nombre del usuario a mostrar
                  const displayName = comment.user?.username 
                    || comment.user?.email 
                    || (comment.user_id === user?.id ? (user?.full_name || user?.username || user?.email) : null)
                    || 'Unknown User';
                  
                  return (
                  <div key={comment.id} className="border rounded-lg p-3 bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      {canDeleteComment(comment) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}