import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { useAuthStore } from './stores/authStore';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Statistics = lazy(() => import('./pages/Statistics'));
const AdminStatistics = lazy(() => import('./pages/AdminStatistics'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Users = lazy(() => import('./pages/Users'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Route wrapper to show correct statistics based on role
function StatsRoute() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  return isAdmin ? <AdminStatistics /> : <Statistics />;
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Rutas para usuarios regulares */}
                  <Route 
                    path="/" 
                    element={
                      <RoleProtectedRoute allowedRoles={['regular']}>
                        <Dashboard />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/tasks" 
                    element={
                      <RoleProtectedRoute allowedRoles={['regular']}>
                        <Tasks />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/stats" 
                    element={
                      <RoleProtectedRoute allowedRoles={['regular']}>
                        <Statistics />
                      </RoleProtectedRoute>
                    } 
                  />
                  
                  {/* Rutas para administradores */}
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/users" 
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <Users />
                      </RoleProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/stats" 
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminStatistics />
                      </RoleProtectedRoute>
                    } 
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
