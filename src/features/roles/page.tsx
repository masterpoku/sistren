'use client'

import * as React from 'react'
import {
  getAllRolesWithPermissions,
  assignPermissionToRole,
  removePermissionFromRole,
} from '@/actions/permissions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Shield,
  Plus,
  Minus,
  Star,
  CheckCircle,
  Gear,
} from 'phosphor-react'

interface Permission {
  id: number
  name: string
  resource: string
  action: string
}

interface RoleWithPermissions {
  id: number
  name: string
  description: string | null
  level: number
  isDefault: boolean
  permissions: Permission[]
}

const roleColors: Record<string, string> = {
  superadmin: 'bg-red-100 text-red-800 border-red-200',
  administrator: 'bg-blue-100 text-blue-800 border-blue-200',
  guru: 'bg-green-100 text-green-800 border-green-200',
  siswa: 'bg-amber-100 text-amber-800 border-amber-200',
  alumni: 'bg-gray-100 text-gray-800 border-gray-200',
}

export default function RolesPage() {
  const [roles, setRoles] = React.useState<RoleWithPermissions[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedRole, setSelectedRole] = React.useState<RoleWithPermissions | null>(null)
  const [allPermissions, setAllPermissions] = React.useState<Permission[]>([])

  React.useEffect(() => {
    async function loadRoles() {
      try {
        const data = await getAllRolesWithPermissions()
        setRoles(data)
        
        // Flatten all permissions for the dialog
        const allPerms: Permission[] = []
        const seen = new Set<number>()
        for (const role of data) {
          for (const perm of role.permissions) {
            if (!seen.has(perm.id)) {
              seen.add(perm.id)
              allPerms.push(perm)
            }
          }
        }
        setAllPermissions(allPerms.sort((a, b) => a.resource.localeCompare(b.resource)))
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRoles()
  }, [])

  const handleAssignPermission = async (roleId: number, permissionId: number) => {
    try {
      await assignPermissionToRole(roleId, permissionId)
      // Reload roles
      const data = await getAllRolesWithPermissions()
      setRoles(data)
      if (selectedRole?.id === roleId) {
        setSelectedRole(data.find(r => r.id === roleId) || null)
      }
    } catch (error) {
      console.error('Failed to assign permission:', error)
    }
  }

  const handleRemovePermission = async (roleId: number, permissionId: number) => {
    if (!confirm('Yakin ingin menghapus permission dari role ini?')) return
    
    try {
      await removePermissionFromRole(roleId, permissionId)
      // Reload roles
      const data = await getAllRolesWithPermissions()
      setRoles(data)
      if (selectedRole?.id === roleId) {
        setSelectedRole(data.find(r => r.id === roleId) || null)
      }
    } catch (error) {
      console.error('Failed to remove permission:', error)
    }
  }

  // Group permissions by resource for display
  const groupPermissionsByResource = (perms: Permission[]) => {
    const grouped: Record<string, Permission[]> = {}
    for (const perm of perms) {
      if (!grouped[perm.resource]) {
        grouped[perm.resource] = []
      }
      grouped[perm.resource].push(perm)
    }
    return grouped
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Kelola Roles</h1>
          <p className="text-muted-foreground">
            Atur permissions untuk setiap role.
          </p>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {roles.map(role => (
          <Card
            key={role.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${roleColors[role.name] || ''}`}
            onClick={() => setSelectedRole(role)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Shield className="h-5 w-5" />
                {role.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Level</span>
                  <Badge variant="secondary">{role.level}</Badge>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">Permissions</span>
                  <span className="text-lg font-bold">{role.permissions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Details for Selected Role */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6" />
                <div>
                  <CardTitle className="capitalize">{selectedRole.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Level {selectedRole.level} • {selectedRole.permissions.length} permissions
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedRole(null)}>
                Tutup
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Permissions yang Dimiliki
              </h3>
              
              {Object.entries(groupPermissionsByResource(selectedRole.permissions)).map(
                ([resource, perms]) => (
                  <div key={resource}>
                    <h4 className="text-sm font-semibold mb-2 capitalize">{resource}</h4>
                    <div className="flex flex-wrap gap-2">
                      {perms.map(perm => (
                        <Badge
                          key={perm.id}
                          variant="secondary"
                          className="gap-1"
                        >
                          {perm.action}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemovePermission(selectedRole.id, perm.id)
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              )}
              
              {selectedRole.permissions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Role ini belum memiliki permissions.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Available Permissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semua Permissions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Klik untuk menambahkan permission ke role yang dipilih
              </p>
            </div>
            {selectedRole && (
              <Badge>
                Mengatur: <span className="capitalize ml-1">{selectedRole.name}</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {Object.entries(groupPermissionsByResource(allPermissions)).map(
                ([resource, perms]) => (
                  <div key={resource}>
                    <h4 className="text-sm font-semibold mb-2 capitalize flex items-center gap-2">
                      {resource}
                      <Badge variant="outline">{perms.length}</Badge>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {perms.map(perm => {
                        const isAssigned = selectedRole?.permissions.some(
                          p => p.id === perm.id
                        )
                        return (
                          <Badge
                            key={perm.id}
                            variant={isAssigned ? 'default' : 'outline'}
                            className="cursor-pointer gap-2"
                            onClick={() => {
                              if (selectedRole) {
                                if (isAssigned) {
                                  handleRemovePermission(selectedRole.id, perm.id)
                                } else {
                                  handleAssignPermission(selectedRole.id, perm.id)
                                }
                              }
                            }}
                          >
                            {perm.action}
                            {isAssigned ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Instruction */}
      {!selectedRole && (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Gear className="h-5 w-5 mr-2" />
          <span>Klik role di atas untuk melihat dan mengatur permissions</span>
        </div>
      )}
    </div>
  )
}