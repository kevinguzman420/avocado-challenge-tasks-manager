import { useEffect, useMemo } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { tasksApi } from '../api/tasks';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart 
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

function Statistics() {
  const { tasks, stats, setStats } = useTaskStore();

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const statsData = await tasksApi.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [setStats]);

  // Calculate real data from tasks
  const priorityData = useMemo(() => [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' },
  ], [tasks]);

  const completionData = useMemo(() => [
    { name: 'Completed', value: stats?.completed || 0, color: '#10b981' },
    { name: 'Pending', value: stats?.pending || 0, color: '#f59e0b' },
    { name: 'Overdue', value: stats?.overdue || 0, color: '#ef4444' },
  ], [stats]);

  // Calculate tasks by creation date (last 30 days)
  const tasksOverTime = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const created = tasks.filter(t => t.created_at?.startsWith(date)).length;
      const completed = tasks.filter(t => t.completed && t.updated_at?.startsWith(date)).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created,
        completed,
      };
    }).filter((_, i) => i % 3 === 0); // Show every 3rd day to avoid clutter
  }, [tasks]);

  // Calculate completion rate over time
  const completionTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const total = tasks.filter(t => t.created_at && new Date(t.created_at) <= new Date(date)).length;
      const completed = tasks.filter(t => t.completed && t.updated_at && new Date(t.updated_at) <= new Date(date)).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        rate,
      };
    });
  }, [tasks]);

  // Calculate tasks due this week vs next week
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const thisWeek = tasks.filter(t => {
      const dueDate = new Date(t.due_date);
      return !t.completed && dueDate >= now && dueDate < weekFromNow;
    }).length;

    const nextWeek = tasks.filter(t => {
      const dueDate = new Date(t.due_date);
      return !t.completed && dueDate >= weekFromNow && dueDate < twoWeeksFromNow;
    }).length;

    return [
      { period: 'This Week', count: thisWeek, color: '#f59e0b' },
      { period: 'Next Week', count: nextWeek, color: '#3b82f6' },
    ];
  }, [tasks]);

  // Calculate average completion time
  const avgCompletionTime = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed && t.created_at && t.updated_at);
    if (completedTasks.length === 0) return 0;

    const totalDays = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created_at!);
      const completed = new Date(task.updated_at!);
      const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return Math.round(totalDays / completedTasks.length * 10) / 10;
  }, [tasks]);

  // Calculate completion rate
  const completionRate = useMemo(() => {
    const total = stats?.total || 0;
    const completed = stats?.completed || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [stats]);

  // Calculate trend (compared to last period)
  const taskTrend = useMemo(() => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekTasks = tasks.filter(t => t.created_at && new Date(t.created_at) >= lastWeek).length;
    const lastWeekTasks = tasks.filter(t => {
      const created = t.created_at && new Date(t.created_at);
      return created && created >= twoWeeksAgo && created < lastWeek;
    }).length;

    if (lastWeekTasks === 0) return 0;
    return Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100);
  }, [tasks]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Statistics & Analytics</h1>
        <p className="text-sm text-muted-foreground">Real-time task insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
            <div className="flex items-center mt-2 text-xs">
              {taskTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={taskTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(taskTrend)}% from last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.completed || 0} of {stats?.total || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Completion</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{avgCompletionTime}</div>
            <p className="text-xs text-muted-foreground mt-2">days per task</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Tasks grouped by priority level</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {priorityData.map((entry, index) => (
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
            <CardTitle className="text-lg">Status Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Current task status breakdown</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {completionData.map((entry, index) => (
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
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            <p className="text-sm text-muted-foreground">Tasks due soon</p>
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tasks Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Activity (Last 30 Days)</CardTitle>
            <p className="text-sm text-muted-foreground">Created vs completed tasks</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tasksOverTime}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorCreated)" 
                  name="Created"
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Weekly completion percentage</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Completion Rate (%)"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
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
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTasks[0]?.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">tasks due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Next Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTasks[1]?.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">tasks due next week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">active tasks remaining</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Statistics;