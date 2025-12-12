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
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  due_date: z.string().min(1, 'La fecha de vencimiento es requerida'),
  due_time: z.string().min(1, 'La hora de vencimiento es requerida'),
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
        <CardTitle>{task ? 'Editar Tarea' : 'Crear Nueva Tarea'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input {...register('title')} placeholder="Ingresa el título de la tarea" />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Textarea
              {...register('description')}
              placeholder="Describe los detalles de la tarea"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Vencimiento</label>
              <Input type="date" {...register('due_date')} />
              {errors.due_date && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.due_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hora de Vencimiento</label>
              <Input type="time" {...register('due_time')} />
              {errors.due_time && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.due_time.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridad</label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setValue('priority', value as 'low' | 'medium' | 'high')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>
                <SelectContent className=' bg-card '>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
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
              Asignado A
            </label>
            <Input
              value={user?.full_name || user?.username || user?.email || 'Usuario Desconocido'}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Las tareas se asignan automáticamente a ti
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : task
                ? 'Actualizar Tarea'
                : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
