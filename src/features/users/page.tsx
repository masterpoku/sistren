'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchAllUsers } from '@/actions/users'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowsDownUp,
  DotsThree,
  Eye,
  Pencil,
  Trash,
  UserPlus,
} from 'phosphor-react'

interface User {
  id: number
  name: string | null
  email: string
  roleId: number | null
  confirmed: boolean | null
  createdAt: Date | null
}

const roleLabels: Record<number, string> = {
  1: 'Super Admin',
  2: 'Administrator',
  3: 'Guru',
  4: 'Siswa',
  5: 'Alumni',
}

const roleBadgeVariant: Record<number, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  1: 'destructive',
  2: 'default',
  3: 'secondary',
  4: 'outline',
  5: 'outline',
}

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Pilih baris"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowsDownUp className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Nama',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name') || '-'}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'roleId',
    header: 'Role',
    cell: ({ row }) => {
      const roleId = row.getValue('roleId') as number | null
      return (
        <Badge
          variant={roleId ? (roleBadgeVariant[roleId] || 'outline') : 'outline'}
          className="capitalize"
        >
          {roleId ? roleLabels[roleId] || `Role ${roleId}` : 'Unknown'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'confirmed',
    header: 'Status',
    cell: ({ row }) => {
      const confirmed = row.getValue('confirmed') as boolean | null
      return (
        <Badge variant={confirmed ? 'default' : 'secondary'}>
          {confirmed ? 'Aktif' : 'Pending'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <DotsThree className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.email)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" /> Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" /> Edit Data
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <Trash className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchAllUsers()
        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const roleCounts = users.reduce((acc, user) => {
    const roleId = user.roleId || 0
    acc[roleId] = (acc[roleId] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Kelola Pengguna</h1>
          <p className="text-muted-foreground">
            Manajemen semua pengguna sistem.
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((roleId) => (
              <div key={roleId} className="rounded-lg border bg-card p-6">
                <div className="text-sm font-medium text-muted-foreground">
                  {roleLabels[roleId] || `Role ${roleId}`}
                </div>
                <div className="text-2xl font-bold">{roleCounts[roleId] || 0}</div>
              </div>
            ))}
          </div>

          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            exportFilename="data-pengguna-sistren"
          />
        </>
      )}
    </div>
  )
}