'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchAcademic } from '@/actions/academic'
import { fetchEnrollments, createEnrollmentAction, updateEnrollmentAction, deleteEnrollmentAction } from '@/actions/enrollments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DotsThree,
  Pencil,
  Trash,
  Plus,
  BookOpen,
  Users,
} from 'phosphor-react'
import { useToast } from '@/hooks/use-toast'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { EnrollmentSheet, EnrollmentSheetData } from '@/components/enrollments/EnrollmentSheet'

interface Enrollment {
  id: number
  studentId: number
  classId: number
  semesterId: number
  studentName?: string | null
  studentEmail?: string | null
  className?: string | null
  classCode?: string | null
  semesterName?: string | null
  semesterActive?: boolean | null
}

interface StudentOption { id: number; name: string; email: string }
interface ClassOption { id: number; name: string; code: string }
interface SemesterOption { id: number; name: string; academicYear: string; isActive: boolean | null }

export default function EnrollmentsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(true)
  const [academicData, setAcademicData] = React.useState<{ classes: ClassOption[]; majors: any[]; semesters: SemesterOption[] } | null>(null)
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [students, setStudents] = React.useState<StudentOption[]>([])
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editingEnrollment, setEditingEnrollment] = React.useState<Enrollment | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      const [academic, enrollmentData, studentData] = await Promise.all([
        fetchAcademic(),
        fetchEnrollments().catch(() => []),
        import('@/actions/enrollments').then(m => m.fetchStudentOptions()).catch(() => []),
      ])
      setAcademicData(academic)
      setEnrollments(enrollmentData as Enrollment[])
      setStudents(studentData as StudentOption[])
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (data: EnrollmentSheetData) => {
    if (editingEnrollment) {
      const result = await updateEnrollmentAction({ id: editingEnrollment.id, classId: data.classId, semesterId: data.semesterId })
      if (!result.success) {
        toast({ title: 'Error', description: result.error || 'Gagal memperbarui', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: 'Pendaftaran diperbarui' })
    } else {
      const result = await createEnrollmentAction(data)
      if (!result.success) {
        toast({ title: 'Error', description: result.error || 'Gagal mendaftarkan', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: 'Siswa didaftarkan' })
    }
    setSheetOpen(false)
    setEditingEnrollment(null)
    await loadData()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus pendaftaran ini?')) return
    const result = await deleteEnrollmentAction(id)
    if (!result.success) {
      toast({ title: 'Gagal', description: result.error || 'Tidak bisa menghapus', variant: 'destructive' })
      return
    }
    toast({ title: 'Berhasil', description: 'Pendaftaran dihapus' })
    await loadData()
  }

  const columns: ColumnDef<Enrollment>[] = React.useMemo(() => [
    {
      accessorKey: 'studentName',
      header: 'Nama Siswa',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.studentName || '—'}</div>
          <div className="text-xs text-muted-foreground">{row.original.studentEmail || ''}</div>
        </div>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Kelas',
      cell: ({ row }) => row.original.className ? `${row.original.className} (${row.original.classCode})` : '—',
    },
    {
      accessorKey: 'semesterName',
      header: 'Semester',
      cell: ({ row }) => (
        <div>
          <div>{row.original.semesterName || '—'}</div>
          {row.original.semesterActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Aktif</span>}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const enr = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><DotsThree className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <RequirePermission permission="enrollments.update">
                <DropdownMenuItem
                  onClick={() => { setEditingEnrollment(enr); setSheetOpen(true) }}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="enrollments.delete">
                <DropdownMenuItem
                  onClick={() => handleDelete(enr.id)}
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
  ], [handleDelete])

  const activeSemesters = academicData?.semesters.filter(s => s.isActive) || []

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Kelola Pendaftaran</h1>
          <p className="text-muted-foreground">Kartu Rencana Studi (KRS) siswa per semester</p>
        </div>
        <RequirePermission permission="enrollments.create">
          <Button className="gap-2" onClick={() => { setEditingEnrollment(null); setSheetOpen(true) }}>
            <Plus className="h-4 w-4" /> Tambah Pendaftaran
          </Button>
        </RequirePermission>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{academicData?.classes.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jurusan</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{academicData?.majors.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Semester Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSemesters.length}</div>
              </CardContent>
            </Card>
          </div>

          <DataTable columns={columns} data={enrollments} searchKey="studentName" exportFilename="data-krs-sistren" />
        </>
      )}

      <EnrollmentSheet
        key={editingEnrollment?.id || 'new-enrollment'}
        open={sheetOpen}
        onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditingEnrollment(null) }}
        onSubmit={handleSubmit}
        students={students}
        classes={academicData?.classes || []}
        semesters={academicData?.semesters || []}
        initialData={editingEnrollment || undefined}
      />
    </div>
  )
}