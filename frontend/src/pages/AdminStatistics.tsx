import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getUsers } from '../api/users';
import { tasksApi } from '../api/tasks';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

interface UserTaskStats {
  name: string;
  totalTasks: number;
  completed: number;
  pending: number;
  high: number;
  medium: number;
  low: number;
}

function AdminStatistics() {
  const [users, setUsers] = useState<User[]>([]);
  const [userTaskStats, setUserTaskStats] = useState<UserTaskStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load only regular users (admins don't have tasks)
        const usersResponse = await getUsers();
        const regularUsers = usersResponse.filter(u => u.role === 'regular');
        setUsers(regularUsers);
        
        // Fetch task stats for each regular user
        const statsPromises = regularUsers.map(async (user) => {
          try {
            console.log(`🔍 Fetching tasks for user ${user.id} (${user.email})...`);
            const tasksResponse = await tasksApi.getTasks({ assigned_to: user.id }, 1, 100);
            console.log(`📦 Response for user ${user.id}:`, tasksResponse);
            const tasks = tasksResponse.items || [];
            console.log(`✅ Tasks array for user ${user.id}:`, tasks, 'Length:', tasks.length);
            
            const stats = {
              name: user.full_name || user.email.split('@')[0],
              totalTasks: tasks.length,
              completed: tasks.filter((t: any) => t.completed).length,
              pending: tasks.filter((t: any) => !t.completed).length,
              high: tasks.filter((t: any) => t.priority === 'high').length,
              medium: tasks.filter((t: any) => t.priority === 'medium').length,
              low: tasks.filter((t: any) => t.priority === 'low').length,
            };
            console.log(`📊 Stats for ${user.email}:`, stats);
            return stats;
          } catch (error) {
            console.error(`❌ Error fetching tasks for user ${user.id}:`, error);
            return {
              name: user.full_name || user.email.split('@')[0],
              totalTasks: 0,
              completed: 0,
              pending: 0,
              high: 0,
              medium: 0,
              low: 0,
            };
          }
        });
        
        const stats = await Promise.all(statsPromises);
        console.log('📈 Stats calculadas para todos los usuarios:', stats);
        setUserTaskStats(stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const totalTasks = userTaskStats.reduce((sum, u) => sum + u.totalTasks, 0);
    const totalCompleted = userTaskStats.reduce((sum, u) => sum + u.completed, 0);
    const totalPending = userTaskStats.reduce((sum, u) => sum + u.pending, 0);
    
    return {
      users: users.length,
      totalTasks,
      completed: totalCompleted,
      pending: totalPending,
    };
  }, [users, userTaskStats]);

  // Filter users with tasks for display
  const usersWithTasks = useMemo(() => {
    const filtered = userTaskStats.filter(u => u.totalTasks > 0);
    console.log('👥 Users with tasks:', filtered);
    console.log('📊 All user task stats:', userTaskStats);
    return filtered;
  }, [userTaskStats]);

  console.log('🔄 Render - isLoading:', isLoading, 'users:', users.length, 'usersWithTasks:', usersWithTasks.length);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Estadísticas del Sistema</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Vista general de tareas de los usuarios</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios Regulares</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.users}</div>
            <p className="text-xs text-muted-foreground mt-1">usuarios con tareas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tareas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">en el sistema</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.totalTasks > 0 ? Math.round((totals.completed / totals.totalTasks) * 100) : 0}% completadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">por completar</p>
          </CardContent>
        </Card>
      </div>

{/* Main Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tasks by User - Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas por Usuario</CardTitle>
            <p className="text-sm text-muted-foreground">Cantidad de tareas por usuario (totales, completadas y pendientes)</p>
          </CardHeader>
          <CardContent>
            {usersWithTasks.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay tareas asignadas a usuarios aún</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usersWithTasks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalTasks" fill="#3b82f6" name="Total" />
                  <Bar dataKey="completed" fill="#10b981" name="Completadas" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tasks by User - Priorities */}
        <Card>
          <CardHeader>
            <CardTitle>Prioridades por Usuario</CardTitle>
            <p className="text-sm text-muted-foreground">Distribución de prioridades de tareas por usuario</p>
          </CardHeader>
          <CardContent>
            {usersWithTasks.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay tareas asignadas a usuarios aún</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usersWithTasks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="high" fill="#ef4444" name="Alta" stackId="priority" />
                  <Bar dataKey="medium" fill="#f59e0b" name="Media" stackId="priority" />
                  <Bar dataKey="low" fill="#10b981" name="Baja" stackId="priority" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminStatistics;
