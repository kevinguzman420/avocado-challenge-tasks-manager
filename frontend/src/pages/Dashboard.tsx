import { useState, useEffect, useMemo } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { tasksApi } from '../api/tasks';

function Dashboard() {
  const { tasks, setTasks } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Cargar tareas del usuario
        const tasksResponse = await tasksApi.getTasks({}, 1, 100);
        const allTasks = tasksResponse.items || [];
        setTasks(allTasks);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [setTasks]);

  // Calcular estadísticas desde las tareas
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.due_date) < new Date()).length,
  }), [tasks]);

  // Tareas recientes (últimas 5)
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [tasks]);

  // Próximas a vencer (próximas 5 no completadas)
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return tasks
      .filter(t => !t.completed && new Date(t.due_date) > now)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5);
  }, [tasks]);

  const metrics = [
    {
      title: 'Total de Tareas',
      value: stats?.total || 0,
      icon: BarChart3,
      color: 'text-primary',
    },
    {
      title: 'Completadas',
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Pendientes',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Vencidas',
      value: stats?.overdue || 0,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Panel de Control</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Tareas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay tareas recientes</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Prioridad: {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                      </p>
                    </div>
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Próximas Fechas Límite</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay tareas próximas a vencer</p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence: {new Date(task.due_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <AlertTriangle className={`h-5 w-5 shrink-0 ${
                      task.priority === 'high' ? 'text-red-600' : 
                      task.priority === 'medium' ? 'text-yellow-600' : 
                      'text-blue-600'
                    }`} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;