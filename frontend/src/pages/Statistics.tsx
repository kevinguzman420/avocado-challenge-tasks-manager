import { useEffect, useMemo } from 'react'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { tasksApi } from '../api/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
} from 'lucide-react'

function Statistics() {
  const { tasks, stats, setStats } = useTaskStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const statsData = await tasksApi.getStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [setStats])

  // Calculate real data from tasks
  const priorityData = useMemo(
    () => [
      {
        name: 'High',
        value: tasks.filter((t) => t.priority === 'high').length,
        color: '#ef4444',
      },
      {
        name: 'Medium',
        value: tasks.filter((t) => t.priority === 'medium').length,
        color: '#f59e0b',
      },
      {
        name: 'Low',
        value: tasks.filter((t) => t.priority === 'low').length,
        color: '#10b981',
      },
    ],
    [tasks],
  )

  const completionData = useMemo(
    () => [
      { name: 'Completed', value: stats?.completed || 0, color: '#10b981' },
      { name: 'Pending', value: stats?.pending || 0, color: '#f59e0b' },
      { name: 'Overdue', value: stats?.overdue || 0, color: '#ef4444' },
    ],
    [stats],
  )

  // Regular users see only their tasks
  const userTasks = useMemo(() => {
    return tasks.filter((t) => t.assigned_to === user?.id)
  }, [tasks, user?.id])

  // Calculate tasks by creation date (last 30 days)
  const tasksOverTime = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split('T')[0]
    })

    return last30Days
      .map((date) => {
        const created = userTasks.filter((t) => t.created_at?.startsWith(date))
          .length
        const completed = userTasks.filter(
          (t) => t.completed && t.updated_at?.startsWith(date),
        ).length
        return {
          date: new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          created,
          completed,
        }
      })
      .filter((_, i) => i % 3 === 0) // Show every 3rd day to avoid clutter
  }, [userTasks])

  // Calculate completion rate over time
  const completionTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    return last7Days.map((date) => {
      const total = userTasks.filter(
        (t) => t.created_at && new Date(t.created_at) <= new Date(date),
      ).length
      const completed = userTasks.filter(
        (t) =>
          t.completed &&
          t.updated_at &&
          new Date(t.updated_at) <= new Date(date),
      ).length
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        rate,
      }
    })
  }, [userTasks])

  // Calculate tasks due this week vs next week
  const upcomingTasks = useMemo(() => {
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const thisWeek = userTasks.filter((t) => {
      const dueDate = new Date(t.due_date)
      return !t.completed && dueDate >= now && dueDate < weekFromNow
    }).length

    const nextWeek = userTasks.filter((t) => {
      const dueDate = new Date(t.due_date)
      return !t.completed && dueDate >= weekFromNow && dueDate < twoWeeksFromNow
    }).length

    return [
      { period: 'This Week', count: thisWeek, color: '#f59e0b' },
      { period: 'Next Week', count: nextWeek, color: '#3b82f6' },
    ]
  }, [userTasks])

  // Calculate average completion time
  const avgCompletionTime = useMemo(() => {
    const completedTasks = userTasks.filter(
      (t) => t.completed && t.created_at && t.updated_at,
    )
    if (completedTasks.length === 0) return 0

    const totalDays = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created_at!)
      const completed = new Date(task.updated_at!)
      const days =
        (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      return sum + days
    }, 0)

    return Math.round((totalDays / completedTasks.length) * 10) / 10
  }, [userTasks])

  // Calculate completion rate
  const completionRate = useMemo(() => {
    const total = stats?.total || 0
    const completed = stats?.completed || 0
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [stats])

  // Calculate trend (compared to last period)
  const taskTrend = useMemo(() => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const thisWeekTasks = userTasks.filter(
      (t) => t.created_at && new Date(t.created_at) >= lastWeek,
    ).length
    const lastWeekTasks = userTasks.filter((t) => {
      const created = t.created_at && new Date(t.created_at)
      return created && created >= twoWeeksAgo && created < lastWeek
    }).length

    if (lastWeekTasks === 0) return 0
    return Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100)
  }, [userTasks])

  // Recalculate stats based on filtered tasks
  const filteredStats = useMemo(() => {
    const completed = userTasks.filter((t) => t.completed).length
    const pending = userTasks.filter((t) => !t.completed).length
    const overdue = userTasks.filter((t) => {
      if (t.completed) return false
      return new Date(t.due_date) < new Date()
    }).length

    return {
      total: userTasks.length,
      completed,
      pending,
      overdue,
    }
  }, [userTasks])

  // Use filtered tasks for all calculations
  const priorityDataFiltered = useMemo(
    () => [
      {
        name: 'High',
        value: userTasks.filter((t) => t.priority === 'high').length,
        color: '#ef4444',
      },
      {
        name: 'Medium',
        value: userTasks.filter((t) => t.priority === 'medium').length,
        color: '#f59e0b',
      },
      {
        name: 'Low',
        value: userTasks.filter((t) => t.priority === 'low').length,
        color: '#10b981',
      },
    ],
    [userTasks],
  )

  const completionDataFiltered = useMemo(
    () => [
      { name: 'Completed', value: filteredStats.completed, color: '#10b981' },
      { name: 'Pending', value: filteredStats.pending, color: '#f59e0b' },
      { name: 'Overdue', value: filteredStats.overdue, color: '#ef4444' },
    ],
    [filteredStats],
  )

  const completionRateFiltered = useMemo(() => {
    const total = filteredStats.total
    const completed = filteredStats.completed
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [filteredStats])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <span>Mis Estadísticas</span>
            <Users className="h-5 w-5 text-blue-600" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tus perspectivas personales de tareas
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mis Tareas Totales
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredStats.total}</div>
            <div className="flex items-center mt-2 text-xs">
              {taskTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span
                className={taskTrend >= 0 ? 'text-green-600' : 'text-red-600'}
              >
                {Math.abs(taskTrend)}% desde la semana pasada
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mi Completitud
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {completionRateFiltered}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredStats.completed} de {filteredStats.total} completadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Tasks
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {filteredStats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              esperando completitud
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mis Vencidas
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {filteredStats.overdue}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Mi Distribución de Prioridades
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tus tareas por prioridad
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityDataFiltered}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) =>
                    value > 0 ? `${name}: ${value}` : ''
                  }
                >
                  {priorityDataFiltered.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mi Estado de Tareas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tus estados de tareas
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={completionDataFiltered}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) =>
                    value > 0 ? `${name}: ${value}` : ''
                  }
                >
                  {completionDataFiltered.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Fechas Límite</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tareas que vencen pronto
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={upcomingTasks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {upcomingTasks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingTasks[0]?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              tareas que vencen esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Próxima Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingTasks[1]?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              tareas que vencen la próxima semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              tareas activas restantes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Statistics
