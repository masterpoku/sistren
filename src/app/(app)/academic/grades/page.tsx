'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchAcademic } from '@/actions/academic'
import { fetchGrades, inputGradeAction, updateGradeAction, fetchEnrollmentOptions } from '@/actions/grades'
import { fetchSubjects } from '@/actions/academic'
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
  Plus,
  GraduationCap,
  CheckCircle,
} from 'phosphor-react'
import { useToast } from '@/hooks/use-toast'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { GradeSheet, GradeSheetData } from '@/components/grades/GradeSheet'

interface GradeData {
  id: number
  enrollmentId: number
  subjectId: number
  semesterId: number
  score: string | null
  grade: string | null
  predicate: string | null
  studentName?: string | null
  className?: string | null
  semesterName?: string | null
  subjectName?: string | null
  subjectCode?: string | null
}

interface SemesterOption { id: number; name: string; academicYear: string; isActive: boolean | null }
interface SubjectOption { id: number; name: string; code?: string | null }
interface EnrollmentOption { id: number; studentName?: string | null; className?: string | null; semesterName?: string | null }

export default function GradesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(true)
  const [academicData, setAcademicData] = React.useState<{ semesters: SemesterOption[] } | null>(null)
  const [grades, setGrades] = React.useState<GradeData[]>([])
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([])
  const [enrollmentOptions, setEnrollmentOptions] = React.useState<EnrollmentOption[]>([])
  const [selectedSemester, setSelectedSemester] = React.useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editingGrade, setEditingGrade] = React.useState<GradeData | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      const [academic, subjs, enrData] = await Promise.all([
        fetchAcademic(),
        fetchSubjects().catch(() => []),
        fetchEnrollmentOptions().catch(() => []),
      ])
      setAcademicData(academic)
      const activeSemester = academic.semesters.find((s: SemesterOption) => s.isActive)
      if (activeSemester) setSelectedSemester(activeSemester.id)
      setSubjects(subjs as SubjectOption[])
      setEnrollmentOptions(enrData as EnrollmentOption[])
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const loadGrades = React.useCallback(async () => {
    if (!selectedSemester) return
    try {
      const gradeData = await fetchGrades(undefined, selectedSemester)
      setGrades(gradeData as GradeData[])
    } catch {
      setGrades([])
    }
  }, [selectedSemester])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  React.useEffect(() => {
    if (selectedSemester) loadGrades()
  }, [selectedSemester, loadGrades])

  const handleSubmit = async (data: GradeSheetData) => {
    if (editingGrade) {
      const result = await updateGradeAction({
        id: editingGrade.id,
        score: data.score,
        grade: data.grade,
        predicate: data.predicate,
      })
      if (!result.success) {
        toast({ title: 'Error', description: result.error || 'Gagal memperbarui', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: 'Nilai diperbarui' })
    } else {
      const result = await inputGradeAction(data)
      if (!result.success) {
        toast({ title: 'Error', description: result.error || 'Gagal menyimpan', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: 'Nilai disimpan' })
    }
    setSheetOpen(false)
    setEditingGrade(null)
    await loadGrades()
  }

  const columns: ColumnDef<GradeData>[] = React.useMemo(() => [
    {
      accessorKey: 'subjectName',
      header: 'Mata Pelajaran',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.subjectName || '—'}</div>
          <div className="text-xs text-muted-foreground">{row.original.subjectCode || ''}</div>
        </div>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Siswa',
      cell: ({ row }) => row.original.studentName || '—',
    },
    {
      accessorKey: 'className',
      header: 'Kelas',
      cell: ({ row }) => row.original.className || '—',
    },
    {
      accessorKey: 'score',
      header: 'Nilai',
      cell: ({ row }) => row.original.score || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'grade',
      header: 'Huruf',
      cell: ({ row }) => row.original.grade || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'predicate',
      header: 'Predikat',
      cell: ({ row }) => row.original.predicate || <span className="text-muted-foreground">—</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const g = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><DotsThree className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <RequirePermission permission="grades.input">
                <DropdownMenuItem
                  onClick={() => { setEditingGrade(g); setSheetOpen(true) }}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              </RequirePermission>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [])

  const gradedCount = grades.filter(g => g.grade).length
  const avgScore = grades.length > 0
    ? grades.filter(g => g.score).reduce((sum, g) => sum + parseFloat(g.score || '0'), 0) / grades.filter(g => g.score).length
    : 0

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Input Nilai</h1>
          <p className="text-muted-foreground">Kartu Hasil Studi (KHS) dan input nilai siswa</p>
        </div>
        <RequirePermission permission="grades.input">
          <Button className="gap-2" onClick={() => { setEditingGrade(null); setSheetOpen(true) }}>
            <Plus className="h-4 w-4" /> Input Nilai Baru
          </Button>
        </RequirePermission>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {academicData?.semesters.map((semester: SemesterOption) => (
              <Button
                key={semester.id}
                variant={selectedSemester === semester.id ? 'default' : 'outline'}
                onClick={() => setSelectedSemester(semester.id)}
              >
                {semester.name}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Mapel</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{grades.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sudah Dinilai</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gradedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Belum Dinilai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{grades.length - gradedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgScore > 0 ? avgScore.toFixed(1) : '-'}</div>
              </CardContent>
            </Card>
          </div>

          <DataTable columns={columns} data={grades} searchKey="subjectName" exportFilename="data-nilai-sistren" />
        </>
      )}

      <GradeSheet
        key={editingGrade?.id || 'new-grade'}
        open={sheetOpen}
        onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditingGrade(null) }}
        onSubmit={handleSubmit}
        enrollments={enrollmentOptions}
        subjects={subjects}
        semesters={academicData?.semesters || []}
        initialData={editingGrade || undefined}
      />
    </div>
  )
}