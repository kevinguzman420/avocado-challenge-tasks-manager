import { useState, useEffect } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { tasksApi } from '../api/tasks'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { TaskForm } from '../components/TaskForm'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Task, TaskFilters } from '../types'
import clsx from 'clsx'

function Tasks() {
  const {
    filteredTasks,
    filters,
    setFilters,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useTaskStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTasks, setTotalTasks] = useState(0)
  const [tasksPerPage] = useState(10)

  // Fetch tasks function
  const fetchTasks = async (page = currentPage) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await tasksApi.getTasks(filters, page, tasksPerPage)
      // Backend returns 'items' instead of 'tasks'
      setTasks(response.items || response.tasks || [])
      setTotalTasks(response.total || 0)
    } catch (err) {
      setError((err as any).response?.data?.detail || 'Error al cargar tareas')
      console.error('Error fetching tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch tasks on component mount or when filters/page change
  useEffect(() => {
    fetchTasks(currentPage)
  }, [currentPage, filters])

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
    setCurrentPage(1)
  }

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm })
    setCurrentPage(1)
  }

  const handleCreateTask = () => {
    setEditingTask(undefined)
    setIsDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await tasksApi.deleteTask(taskId)
        deleteTask(taskId)
      } catch (err) {
        console.error('Error deleting task:', err)
        alert(
          'Error al eliminar tarea: ' +
            ((err as any)?.response?.data?.detail ||
              (err as Error)?.message ||
              'Error desconocido'),
        )
      }
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = await tasksApi.updateTask(task.id, {
        completed: !task.completed,
      })
      updateTask(task.id, updatedTask)
    } catch (err) {
      console.error('Error updating task:', err)
      alert(
        'Error al actualizar tarea: ' +
          ((err as any)?.response?.data?.detail ||
            (err as Error)?.message ||
            'Error desconocido'),
      )
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      console.log('📝 Enviando datos de tarea:', data)
      if (editingTask) {
        // Update existing task
        const updatedTask = await tasksApi.updateTask(editingTask.id, {
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          priority: data.priority,
        })
        updateTask(editingTask.id, updatedTask)
        console.log('✅ Tarea actualizada correctamente')
      } else {
        // Create new task
        const newTask = await tasksApi.createTask({
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          priority: data.priority,
        })
        addTask(newTask)
        console.log('✅ Tarea creada correctamente:', newTask)
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error('❌ Error guardando tarea:', err)
      alert(
        'Error al guardar tarea: ' +
          ((err as any)?.response?.data?.detail ||
            (err as Error)?.message ||
            'Error desconocido'),
      )
    }
  }

  const handleFormCancel = () => {
    setIsDialogOpen(false)
  }

  const tasks = filteredTasks()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tareas</h1>
          {isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              Cargando tareas...
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => fetchTasks()}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Actualizar'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <TaskForm
                task={editingTask}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select
              value={filters.completed?.toString() || 'all'}
              onValueChange={(value) =>
                handleFilterChange(
                  'completed',
                  value === 'all' ? undefined : value === 'true',
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="false">Pendiente</SelectItem>
                <SelectItem value="true">Completada</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.assigned_to?.toString() || 'all'}
              onValueChange={(value) =>
                handleFilterChange(
                  'assigned_to',
                  value === 'all' ? undefined : parseInt(value),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Asignado A" />
              </SelectTrigger>
              <SelectContent className=" bg-card ">
                <SelectItem value="all">Todos los Usuarios</SelectItem>
                <SelectItem value="1">Usuario 1</SelectItem>
                <SelectItem value="2">Usuario 2</SelectItem>
                {/* TODO: Load users from API */}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                handleFilterChange(
                  'priority',
                  value === 'all' ? undefined : value,
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent className=" bg-card ">
                <SelectItem value="all">Todas las Prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters({})
                setSearchTerm('')
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar tareas
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTasks()}
                    disabled={isLoading}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    {isLoading ? 'Cargando...' : 'Intentar de Nuevo'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron tareas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Estado</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Button
                        variant={task.completed ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleComplete(task)}
                        className={clsx(
                          ' bg-gray-200 hover:bg-gray-300 ',
                          task.completed
                            ? 'bg-green-600 hover:bg-green-700 text-black dark:text-white'
                            : 'border-gray-300 text-gray-600 ',
                        )}
                      >
                        {task.completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4 text-black " />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span
                        className={
                          task.completed
                            ? 'line-through text-muted-foreground'
                            : ''
                        }
                      >
                        {task.title}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.priority === 'high' ? 'destructive' : 'secondary'
                        }
                        className={
                          task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : task.priority === 'low'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : ''
                        }
                      >
                        {task.priority === 'high'
                          ? 'Alta'
                          : task.priority === 'medium'
                          ? 'Media'
                          : 'Baja'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(task.due_date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalTasks > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando{' '}
                {Math.min((currentPage - 1) * tasksPerPage + 1, totalTasks)} a{' '}
                {Math.min(currentPage * tasksPerPage, totalTasks)} de{' '}
                {totalTasks} tareas
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <div className="text-sm font-medium">
                  Página {currentPage} de {Math.ceil(totalTasks / tasksPerPage)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= Math.ceil(totalTasks / tasksPerPage)}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Tasks
