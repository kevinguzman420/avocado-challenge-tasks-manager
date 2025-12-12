import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { useUiStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { ThemeToggle } from './ThemeToggle'
import { Home, CheckSquare, BarChart3, Users, Menu, X } from 'lucide-react'
import clsx from 'clsx'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const isAdmin = user?.role === 'admin'

  const navigation = [
    {
      name: 'Panel de Control',
      href: isAdmin ? '/admin/dashboard' : '/',
      icon: Home,
    },
    { name: 'Tareas', href: '/tasks', icon: CheckSquare, hideForAdmin: true },
    {
      name: 'Estadísticas',
      href: isAdmin ? '/admin/stats' : '/stats',
      icon: BarChart3,
    },
    { name: 'Usuarios', href: '/users', icon: Users, adminOnly: true },
  ]

  const filteredNavigation = navigation.filter((item) => {
    // Hide items marked as adminOnly if user is not admin
    if (item.adminOnly && !isAdmin) return false
    // Hide items marked as hideForAdmin if user is admin
    if (item.hideForAdmin && isAdmin) return false
    return true
  })

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={clsx(
          'sidebar bg-card w-64 border-r transform transition-transform duration-200 ease-in-out flex flex-col',
          'fixed top-0 bottom-0 left-0 h-full z-50',
          'lg:translate-x-0 lg:sticky lg:h-screen',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b shrink-0">
          <img src="/avocado-logo.webp" alt="Logo" className="h-8 w-auto" />
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto min-h-0">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
                onClick={() => {
                  // Cerrar sidebar solo en móvil
                  if (window.innerWidth < 1024) {
                    toggleSidebar()
                  }
                }}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="w-full sm:w-auto"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Top bar */}
        <header className="header bg-card border-b flex items-center justify-between px-4 h-16 lg:ml-0 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggleSidebar}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            <ThemeToggle
              variant="default"
              className="bg-primary/80 hover:bg-primary cursor-pointer"
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
