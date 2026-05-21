'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchStudents, fetchStudentById, createStudent, updateStudent, deleteStudent } from '@/actions/students'
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
import { StudentForm, StudentFormData } from '@/components/students/StudentForm'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useToast } from '@/hooks/use-toast'

interface Student {
  id: string
  name: string
  email: string
  roleId: number | null
}

interface StudentProfile extends Student {
  nik?: string | null
  nisn?: string | null
  birthPlace?: string | null
  birthDate?: string
  gender?: string | null
  address?: string | null
  phone?: string | null
  fatherName?: string | null
  motherName?: string | null
  parentsPhone?: string | null
  religion?: string | null
}

export default function StudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([])
  const [loading, setLoading] = React.useState(true)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingStudent, setEditingStudent] = React.useState<StudentProfile | null>(null)
  const { toast } = useToast()

  const loadStudents = React.useCallback(async () => {
    try {
      const data = await fetchStudents()
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data siswa',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const handleEdit = async (id: string) => {
    try {
      const profile = await fetchStudentById(Number(id))
      if (profile) {
        setEditingStudent(profile)
        setFormOpen(true)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data siswa',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus siswa ini? Data tidak bisa dikembalikan.')) return

    try {
      await deleteStudent(Number(id))
      toast({
        title: 'Berhasil',
        description: 'Siswa berhasil dihapus',
      })
      await loadStudents()
    } catch (error) {
      console.error('Failed to delete student:', error)
      toast({
        title: 'Error',
        description: 'Gagal menghapus siswa',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        await updateStudent({
          id: Number(editingStudent.id),
          name: data.name,
          nik: data.nik,
          nisn: data.nisn,
          birthPlace: data.birthPlace,
          birthDate: data.birthDate,
          gender: data.gender,
          address: data.address,
          phone: data.phone,
          fatherName: data.fatherName,
          motherName: data.motherName,
          parentsPhone: data.parentsPhone,
        })
        toast({
          title: 'Berhasil',
          description: 'Data siswa berhasil diperbarui',
        })
      } else {
        await createStudent({
          email: data.email,
          password: 'Password123!',
          name: data.name,
          nik: data.nik,
          nisn: data.nisn,
          birthPlace: data.birthPlace,
          birthDate: data.birthDate,
          gender: data.gender,
          address: data.address,
          phone: data.phone,
          fatherName: data.fatherName,
          motherName: data.motherName,
          parentsPhone: data.parentsPhone,
        })
        toast({
          title: 'Berhasil',
          description: 'Siswa baru berhasil ditambahkan',
        })
      }
      setFormOpen(false)
      setEditingStudent(null)
      await loadStudents()
    } catch (error) {
      console.error('Failed to save student:', error)
      toast({
        title: 'Error',
        description: editingStudent ? 'Gagal memperbarui data siswa' : 'Gagal menambahkan siswa',
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
          <h1 className="text-3xl font-bold tracking-tight">Data Siswa</h1>
          <p className="text-muted-foreground">
            Manajemen data siswa SMK TERPADU.
          </p>
        </div>
        <RequirePermission permission="students.create">
          <Button className="gap-2" onClick={() => { setEditingStudent(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Tambah Siswa
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
                Total Siswa
              </div>
              <div className="text-2xl font-bold">{students.length}</div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={students}
            searchKey="name"
            exportFilename="data-siswa-sistren"
          />
        </>
      )}

      <StudentForm
        key={editingStudent?.id || 'new'}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setTimeout(() => setEditingStudent(null), 200)
        }}
        onSubmit={handleSubmit}
        initialData={editingStudent ? {
          name: editingStudent.name,
          email: editingStudent.email,
          nik: editingStudent.nik || '',
          nisn: editingStudent.nisn || '',
          birthPlace: editingStudent.birthPlace || '',
          birthDate: editingStudent.birthDate || '',
          gender: (editingStudent.gender as 'male' | 'female') || 'male',
          address: editingStudent.address || '',
          phone: editingStudent.phone || '',
          fatherName: editingStudent.fatherName || '',
          motherName: editingStudent.motherName || '',
          parentsPhone: editingStudent.parentsPhone || '',
        } : undefined}
      />
    </div>
  )
}

function buildColumns(onEdit: (id: string) => void, onDelete: (id: string) => void): ColumnDef<Student>[] {
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
        const student = row.original

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
                onClick={() => navigator.clipboard.writeText(String(student.id))}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" /> Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <RequirePermission permission="students.update">
                <DropdownMenuItem
                  onClick={() => onEdit(student.id)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit Data
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="students.delete">
                <DropdownMenuItem
                  onClick={() => onDelete(student.id)}
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
