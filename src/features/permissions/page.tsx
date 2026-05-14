'use client'

import * as React from 'react'
import {
  getPermissionsByResource,
  deletePermission,
} from '@/actions/permissions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  DotsThree,
  Pencil,
  Trash,
  ShieldCheck,
  CaretRight,
} from 'phosphor-react'

interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description: string | null
}

type PermissionsByResource = Record<string, Permission[]>

const resourceLabels: Record<string, string> = {
  users: 'Manajemen Pengguna',
  students: 'Manajemen Siswa',
  teachers: 'Manajemen Guru',
  grades: 'Nilai & Transkrip',
  payments: 'Pembayaran',
  announcements: 'Pengumuman',
  enrollments: 'Pendaftaran',
  academic: 'Akademik',
  classes: 'Kelas',
  majors: 'Jurusan',
  subjects: 'Mata Pelajaran',
  semesters: 'Semester',
  payment_methods: 'Metode Pembayaran',
  system_configs: 'Konfigurasi Sistem',
  profile: 'Profil',
  settings: 'Pengaturan',
  permissions: 'Hak Akses',
  roles: 'Peran',
}

const resourceColors: Record<string, string> = {
  users: 'bg-blue-100 text-blue-800',
  students: 'bg-green-100 text-green-800',
  teachers: 'bg-purple-100 text-purple-800',
  grades: 'bg-amber-100 text-amber-800',
  payments: 'bg-emerald-100 text-emerald-800',
  announcements: 'bg-cyan-100 text-cyan-800',
  enrollments: 'bg-indigo-100 text-indigo-800',
  academic: 'bg-teal-100 text-teal-800',
  classes: 'bg-orange-100 text-orange-800',
  majors: 'bg-rose-100 text-rose-800',
  subjects: 'bg-lime-100 text-lime-800',
  semesters: 'bg-sky-100 text-sky-800',
  payment_methods: 'bg-fuchsia-100 text-fuchsia-800',
  system_configs: 'bg-violet-100 text-violet-800',
  profile: 'bg-pink-100 text-pink-800',
  settings: 'bg-gray-100 text-gray-800',
  permissions: 'bg-red-100 text-red-800',
  roles: 'bg-yellow-100 text-yellow-800',
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = React.useState<PermissionsByResource>({})
  const [loading, setLoading] = React.useState(true)
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    async function loadPermissions() {
      try {
        const data = await getPermissionsByResource()
        setPermissions(data)
        // Expand first group by default
        const firstGroup = Object.keys(data)[0]
        if (firstGroup) {
          setExpandedGroups(new Set([firstGroup]))
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPermissions()
  }, [])

  const toggleGroup = (resource: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(resource)) {
        next.delete(resource)
      } else {
        next.add(resource)
      }
      return next
    })
  }

  const handleDelete = async (permissionId: number, permissionName: string) => {
    const confirmed = confirm(
      `⚠️ PERINGATAN: Penghapusan tidak bisa dibatalkan!\n\n` +
      `Akan menghapus permission "${permissionName}"\n` +
      `Semua role yang memiliki permission ini akan kehilangan akses tersebut.\n\n` +
      `Lanjutkan?`
    )
    if (!confirmed) return
    
    try {
      await deletePermission(permissionId)
      // Reload
      const data = await getPermissionsByResource()
      setPermissions(data)
    } catch (error) {
      console.error('Failed to delete permission:', error)
    }
  }

  const totalPermissions = Object.values(permissions).reduce(
    (sum, perms) => sum + perms.length,
    0
  )
  const totalGroups = Object.keys(permissions).length

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
          <h1 className="text-3xl font-bold tracking-tight">Kelola Permissions</h1>
          <p className="text-muted-foreground">
            {totalPermissions} permissions dalam {totalGroups} resource groups.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Permission
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPermissions}</div>
            <p className="text-xs text-muted-foreground">across {totalGroups} resource groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Superadmin</CardTitle>
            <Badge variant="destructive">100</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">51</div>
            <p className="text-xs text-muted-foreground">all permissions access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrator</CardTitle>
            <Badge variant="default">80</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">44</div>
            <p className="text-xs text-muted-foreground">admin-level permissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions List */}
      <div className="space-y-4">
        {Object.entries(permissions).map(([resource, perms]) => (
          <Card key={resource}>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleGroup(resource)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={resourceColors[resource] || 'bg-gray-100'}>
                    {resource}
                  </Badge>
                  <CardTitle className="text-base">
                    {resourceLabels[resource] || resource}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {perms.length} permissions
                  </span>
                  <CaretRight
                    className={`h-4 w-4 transition-transform ${
                      expandedGroups.has(resource) ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>
            </CardHeader>
            
            {expandedGroups.has(resource) && (
              <CardContent>
                <div className="grid gap-2">
                  {perms.map(perm => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <code className="text-sm font-mono font-medium">
                          {perm.name}
                        </code>
                        <span className="text-xs text-muted-foreground">
                          {perm.description || `${perm.action} action on ${perm.resource}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {perm.action}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <DotsThree className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive"
                              onClick={() => handleDelete(perm.id, perm.name)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}