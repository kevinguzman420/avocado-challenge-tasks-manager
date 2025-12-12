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
    <div className=" container min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={clsx(
          'sidebar bg-card w-full h-full border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <img src="/avocado-logo.webp" alt="Logo" className="h-8 w-auto" />
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 ">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors `,
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
                onClick={() => toggleSidebar()}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <header className="header bg-card border-b flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-4 ml-auto">
          <ThemeToggle
            variant="default"
            className="bg-primary/80 hover:bg-primary cursor-pointer"
          />
        </div>
      </header>

      {/* Main content */}
      <div className="main">
        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
