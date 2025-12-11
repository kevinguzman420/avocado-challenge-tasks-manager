import { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { tasksApi } from '../api/tasks';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { TaskForm } from '../components/TaskForm';
import { TaskComments } from '../components/TaskComments';
import { Plus, Search, Filter, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Task, TaskFilters } from '../types';

function Tasks() {
  const { filteredTasks, filters, setFilters, setTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks function
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tasksApi.getTasks();
      // Backend returns 'items' instead of 'tasks'
      setTasks(response.items || response.tasks || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksApi.deleteTask(taskId);
        deleteTask(taskId);
      } catch (err: any) {
        console.error('Error deleting task:', err);
        alert('Failed to delete task: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    // try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await tasksApi.updateTask(editingTask.id, {
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          priority: data.priority,
          // assigned_to: data.assigned_to ? parseInt(data.assigned_to) : undefined,
        });
        updateTask(editingTask.id, updatedTask);
      } else {
        // Create new task
        const newTask = await tasksApi.createTask({
          title: data.title,
          description: data.description,
          due_date: data.due_date,
          priority: data.priority,
          // assigned_to: data.assigned_to ? parseInt(data.assigned_to) : 0,
        });
        addTask(newTask);
      }
      setIsDialogOpen(false);
    // } catch (err: any) {
    //   console.error('Error saving task:', err);
    //   alert('Failed to save task: ' + (err.response?.data?.detail || err.message));
    // }
  };

  const handleFormCancel = () => {
    setIsDialogOpen(false);
  };

  const tasks = filteredTasks();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          {isLoading && <p className="text-sm text-muted-foreground mt-1">Loading tasks...</p>}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchTasks}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
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
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search tasks..."
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
                handleFilterChange('completed', value === 'all' ? undefined : value === 'true')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="false">Pending</SelectItem>
                <SelectItem value="true">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.assigned_to?.toString() || 'all'}
              onValueChange={(value) =>
                handleFilterChange('assigned_to', value === 'all' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="1">User 1</SelectItem>
                <SelectItem value="2">User 2</SelectItem>
                {/* TODO: Load users from API */}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                handleFilterChange('priority', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({})}
            >
              Clear Filters
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
                Error loading tasks
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTasks}
                    disabled={isLoading}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    {isLoading ? 'Loading...' : 'Try Again'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={task.completed ? 'text-green-600' : 'text-yellow-600'}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <TaskComments taskId={task.id} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Tasks;