import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useAuthStore } from '../stores/authStore'
import type { Task } from '../types'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  due_date: z.string().min(1, 'Due date is required'),
  due_time: z.string().min(1, 'Due time is required'),
  priority: z.enum(['low', 'medium', 'high']),
  assigned_to: z.number().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          due_date: task.due_date.split('T')[0], // Format for date input
          due_time: task.due_date.includes('T')
            ? task.due_date.split('T')[1].substring(0, 5)
            : '12:00', // Extract time
          priority: task.priority,
          assigned_to: task.assigned_to,
        }
      : {
          priority: 'medium',
          assigned_to: user?.id,
          due_time: '12:00', // Default time
        },
  })

  const priority = watch('priority')

  const handleFormSubmit = (data: TaskFormData) => {
    // Combinar fecha y hora en formato ISO
    const dateTime = `${data.due_date}T${data.due_time}:00Z`

    // Crear el objeto con el formato correcto
    const formattedData = {
      ...data,
      due_date: dateTime,
    }

    onSubmit(formattedData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{task ? 'Edit Task' : 'Create New Task'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input {...register('title')} placeholder="Enter task title" />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Input type="date" {...register('due_date')} />
              {errors.due_date && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.due_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Time</label>
              <Input type="time" {...register('due_time')} />
              {errors.due_time && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.due_time.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setValue('priority', value as 'low' | 'medium' | 'high')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Assigned To
            </label>
            <Input
              value={user?.full_name || user?.username || user?.email || 'Unknown User'}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tasks are automatically assigned to you
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : task
                ? 'Update Task'
                : 'Create Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
