'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchTeachers, fetchTeacherById, createTeacher, updateTeacher, deleteTeacher } from '@/actions/teachers'
import { DataTable } from '@/components/ui/data-table'
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
  Plus,
} from 'phosphor-react'
import { TeacherForm, TeacherFormData } from '@/components/teachers/TeacherForm'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useToast } from '@/hooks/use-toast'

interface Teacher {
  id: string
  name: string
  email: string
  roleId: number | null
}

interface TeacherProfile extends Teacher {
  nik?: string | null
  phone?: string | null
  birthPlace?: string | null
  birthDate?: string
  address?: string | null
}

export default function TeachersPage() {
  const [teachers, setTeachers] = React.useState<Teacher[]>([])
  const [loading, setLoading] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingTeacher, setEditingTeacher] = React.useState<TeacherProfile | null>(null)
  const { toast } = useToast()

  const loadTeachers = React.useCallback(async () => {
    try {
      const data = await fetchTeachers()
      setTeachers(data)
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data guru',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    loadTeachers()
  }, [loadTeachers])

  const handleEdit = async (id: string) => {
    try {
      const profile = await fetchTeacherById(Number(id))
      if (profile) {
        setEditingTeacher(profile)
        setFormOpen(true)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data guru',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus guru ini? Data tidak bisa dikembalikan.')) return

    try {
      await deleteTeacher(Number(id))
      toast({
        title: 'Berhasil',
        description: 'Guru berhasil dihapus',
      })
      await loadTeachers()
    } catch (error) {
      console.error('Failed to delete teacher:', error)
      toast({
        title: 'Error',
        description: 'Gagal menghapus guru',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (data: TeacherFormData) => {
    try {
      if (editingTeacher) {
        await updateTeacher({
          id: Number(editingTeacher.id),
          name: data.name,
          nik: data.nik,
          phone: data.phone,
          birthPlace: data.birthPlace,
          birthDate: data.birthDate,
          address: data.address,
        })
        toast({
          title: 'Berhasil',
          description: 'Data guru berhasil diperbarui',
        })
      } else {
        await createTeacher({
          email: data.email,
          password: 'Password123!',
          name: data.name,
          nik: data.nik,
          phone: data.phone,
          birthPlace: data.birthPlace,
          birthDate: data.birthDate,
          address: data.address,
        })
        toast({
          title: 'Berhasil',
          description: 'Guru baru berhasil ditambahkan',
        })
      }
      setFormOpen(false)
      setEditingTeacher(null)
      await loadTeachers()
    } catch (error) {
      console.error('Failed to save teacher:', error)
      toast({
        title: 'Error',
        description: editingTeacher ? 'Gagal memperbarui data guru' : 'Gagal menambahkan guru',
        variant: 'destructive',
      })
    }
  }

  const columns = React.useMemo(
    () => buildColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Data Guru</h1>
          <p className="text-muted-foreground">
            Manajemen data guru SMK TERPADU.
          </p>
        </div>
        <RequirePermission permission="teachers.create">
          <Button className="gap-2" onClick={() => { setEditingTeacher(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Tambah Guru
          </Button>
        </RequirePermission>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">
                Total Guru
              </div>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={teachers}
            searchKey="name"
            exportFilename="data-guru-sistren"
          />
        </>
      )}

      <TeacherForm
        key={editingTeacher?.id || 'new'}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setTimeout(() => setEditingTeacher(null), 200)
        }}
        onSubmit={handleSubmit}
        initialData={editingTeacher ? {
          name: editingTeacher.name,
          email: editingTeacher.email,
          nik: editingTeacher.nik || '',
          phone: editingTeacher.phone || '',
          teacherId: '',
          subjectTaught: '',
          birthPlace: editingTeacher.birthPlace || '',
          birthDate: editingTeacher.birthDate || '',
          address: editingTeacher.address || '',
        } : undefined}
      />
    </div>
  )
}

function buildColumns(onEdit: (id: string) => void, onDelete: (id: string) => void): ColumnDef<Teacher>[] {
  return [
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
      header: 'Nama Lengkap',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const teacher = row.original

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
                onClick={() => navigator.clipboard.writeText(String(teacher.id))}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" /> Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <RequirePermission permission="teachers.update">
                <DropdownMenuItem
                  onClick={() => onEdit(teacher.id)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Data
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="teachers.delete">
                <DropdownMenuItem
                  onClick={() => onDelete(teacher.id)}
                  className="cursor-pointer text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </RequirePermission>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
