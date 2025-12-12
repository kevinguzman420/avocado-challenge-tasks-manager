import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users as UsersIcon,
  Shield,
  AlertCircle,
  Lock,
} from 'lucide-react'
import type { User } from '../types'
import { getUsers, deleteUser, updateUser } from '../api/users'
import { UserRole, ROLE_LABELS, ROLE_COLORS } from '../constants/roles'

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await getUsers()
      const typedUsers = (response || []).map((user) => ({
        ...user,
        role: user.role as 'admin' | 'regular',
        full_name: user.full_name ?? undefined,
      }))
      setUsers(typedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower) ||
      false
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRoleChange = async (
    userId: number,
    newRole: 'admin' | 'regular',
  ) => {
    try {
      await updateUser(userId, { role: newRole })
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      )
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error al actualizar el rol del usuario')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(userId)
        setUsers(users.filter((user) => user.id !== userId))
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error al eliminar usuario')
      }
    }
  }

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await updateUser(userId, { is_active: !currentStatus })
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_active: !currentStatus } : user,
        ),
      )
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Error al actualizar el estado del usuario')
    }
  }

  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user)
    setNewPassword('')
  }

  const handleCloseEditDialog = () => {
    setEditingUser(null)
    setNewPassword('')
    setIsSubmitting(false)
  }

  const handleUpdatePassword = async () => {
    if (!editingUser || !newPassword) {
      alert('Por favor ingresa una nueva contraseña')
      return
    }

    if (newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await updateUser(editingUser.id, { password: newPassword })
      alert('Contraseña actualizada exitosamente')
      handleCloseEditDialog()
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Error al actualizar contraseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestiona usuarios del sistema y permisos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Total de Usuarios
                </p>
                <p className="text-2xl md:text-3xl font-bold">{users.length}</p>
              </div>
              <UsersIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Administradores
                </p>
                <p className="text-2xl md:text-3xl font-bold">
                  {users.filter((u) => u.role === UserRole.ADMIN).length}
                </p>
              </div>
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Usuarios Activos
                </p>
                <p className="text-2xl md:text-3xl font-bold">
                  {users.filter((u) => u.is_active).length}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o correo electrónico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent className=" bg-card ">
                <SelectItem value="all">Todos los Roles</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                <SelectItem value={UserRole.REGULAR}>
                  Usuario Regular
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
              }}
            >
              Limpiar
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Correo Electrónico</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No se encontraron usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <UsersIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="font-semibold">
                                {user.full_name || user.email.split('@')[0]}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) =>
                                handleRoleChange(
                                  user.id,
                                  value as 'admin' | 'regular',
                                )
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      ROLE_COLORS[
                                        user.role as keyof typeof ROLE_COLORS
                                      ] || ''
                                    }`}
                                  >
                                    {ROLE_LABELS[
                                      user.role as keyof typeof ROLE_LABELS
                                    ] || user.role}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className=" bg-card ">
                                <SelectItem value={UserRole.REGULAR}>
                                  Usuario Regular
                                </SelectItem>
                                <SelectItem value={UserRole.ADMIN}>
                                  Administrador
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleStatus(
                                  user.id,
                                  user.is_active || false,
                                )
                              }
                              className="h-auto p-0"
                            >
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.is_active
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                                }`}
                              >
                                {user.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditDialog(user)}
                                title="Cambiar contraseña"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron usuarios</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <UsersIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {user.full_name || user.email.split('@')[0]}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Rol:</span>
                            <Select
                              value={user.role}
                              onValueChange={(value) =>
                                handleRoleChange(
                                  user.id,
                                  value as 'admin' | 'regular',
                                )
                              }
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      ROLE_COLORS[
                                        user.role as keyof typeof ROLE_COLORS
                                      ] || ''
                                    }`}
                                  >
                                    {ROLE_LABELS[
                                      user.role as keyof typeof ROLE_LABELS
                                    ] || user.role}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className=" bg-card ">
                                <SelectItem value={UserRole.REGULAR}>
                                  Usuario Regular
                                </SelectItem>
                                <SelectItem value={UserRole.ADMIN}>
                                  Administrador
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Estado:</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleStatus(
                                  user.id,
                                  user.is_active || false,
                                )
                              }
                              className="h-auto p-0"
                            >
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.is_active
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                                }`}
                              >
                                {user.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(user)}
                            className="flex-1"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Cambiar Contraseña
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Password Dialog */}
      <Dialog open={!!editingUser} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Contraseña del Usuario</DialogTitle>
            <DialogDescription>
              Cambiar contraseña para{' '}
              {editingUser?.full_name || editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario Actual</label>
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {editingUser?.full_name || editingUser?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {editingUser?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Ingresa nueva contraseña (mín 8 caracteres)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-8"
                  minLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                La contraseña debe tener al menos 8 caracteres de longitud
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseEditDialog}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={isSubmitting || !newPassword || newPassword.length < 8}
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Users
