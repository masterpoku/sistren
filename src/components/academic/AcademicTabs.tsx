'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  DotsThree,
  Pencil,
  Trash,
  Plus,
} from 'phosphor-react'
import { useToast } from '@/hooks/use-toast'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { ClassSheet, ClassSheetData } from './ClassSheet'
import { MajorSheet, MajorSheetData } from './MajorSheet'
import { SemesterSheet, SemesterSheetData } from './SemesterSheet'
import { SubjectSheet, SubjectSheetData } from './SubjectSheet'
import {
  createClass, updateClass, deleteClass,
  createMajor, updateMajor, deleteMajor,
  createSemester, updateSemester, deleteSemester,
  createSubject, updateSubject, deleteSubject,
  fetchSubjects,
} from '@/actions/academic'

// Types
interface ClassEntity { id: number; name: string; code: string }
interface MajorEntity { id: number; name: string; description?: string | null }
interface SemesterEntity { id: number; name: string; academicYear: string; startDate?: string | Date | null; endDate?: string | Date | null; isActive: boolean | null }
interface SubjectEntity { id: number; name: string; code?: string | null; classId: number; majorId?: number | null; credits?: number | null; description?: string | null; className?: string | null; majorName?: string | null }

interface AcademicTabsProps {
  classes: ClassEntity[]
  majors: MajorEntity[]
  semesters: SemesterEntity[]
  subjectEntities: SubjectEntity[]
}

export function AcademicTabs({ classes: initialClasses, majors: initialMajors, semesters: initialSemesters, subjectEntities: initialSubjects }: AcademicTabsProps) {
  const { toast } = useToast()

  // Class state
  const [classes, setClasses] = React.useState(initialClasses)
  const [classSheetOpen, setClassSheetOpen] = React.useState(false)
  const [editingClass, setEditingClass] = React.useState<ClassEntity | null>(null)

  // Major state
  const [majors, setMajors] = React.useState(initialMajors)
  const [majorSheetOpen, setMajorSheetOpen] = React.useState(false)
  const [editingMajor, setEditingMajor] = React.useState<MajorEntity | null>(null)

  // Semester state
  const [semesters, setSemesters] = React.useState(initialSemesters)
  const [semesterSheetOpen, setSemesterSheetOpen] = React.useState(false)
  const [editingSemester, setEditingSemester] = React.useState<SemesterEntity | null>(null)

  // Subject state
  const [subjects, setSubjects] = React.useState(initialSubjects)
  const [subjectSheetOpen, setSubjectSheetOpen] = React.useState(false)
  const [editingSubject, setEditingSubject] = React.useState<SubjectEntity | null>(null)

  // ==================== HANDLERS ====================

  // CLASS HANDLERS
  const handleClassSubmit = async (data: ClassSheetData) => {
    try {
      if (editingClass) {
        const result = await updateClass(editingClass.id, data)
        if (!result.success) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Berhasil', description: 'Kelas diperbarui' })
      } else {
        const result = await createClass(data)
        if (!result.success) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Berhasil', description: 'Kelas ditambahkan' })
      }
      setClassSheetOpen(false)
      setEditingClass(null)
      await reloadClasses()
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan kelas', variant: 'destructive' })
    }
  }

  const handleClassDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus kelas ini?')) return
    const result = await deleteClass(id)
    if (!result.success) {
      toast({ title: 'Gagal', description: result.error || 'Tidak bisa menghapus kelas', variant: 'destructive' })
      return
    }
    toast({ title: 'Berhasil', description: 'Kelas dihapus' })
    await reloadClasses()
  }

  const reloadClasses = async () => {
    const data = await import('@/actions/academic').then(m => m.fetchAcademic())
    setClasses(data.classes)
  }

  // MAJOR HANDLERS
  const handleMajorSubmit = async (data: MajorSheetData) => {
    try {
      if (editingMajor) {
        const result = await updateMajor(editingMajor.id, data)
        if (!result.success) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Berhasil', description: 'Jurusan diperbarui' })
      } else {
        const result = await createMajor(data)
        if (!result.success) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Berhasil', description: 'Jurusan ditambahkan' })
      }
      setMajorSheetOpen(false)
      setEditingMajor(null)
      await reloadMajors()
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan jurusan', variant: 'destructive' })
    }
  }

  const handleMajorDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus jurusan ini?')) return
    const result = await deleteMajor(id)
    if (!result.success) {
      toast({ title: 'Gagal', description: result.error || 'Tidak bisa menghapus jurusan', variant: 'destructive' })
      return
    }
    toast({ title: 'Berhasil', description: 'Jurusan dihapus' })
    await reloadMajors()
  }

  const reloadMajors = async () => {
    const data = await import('@/actions/academic').then(m => m.fetchAcademic())
    setMajors(data.majors)
  }

  // SEMESTER HANDLERS
  const handleSemesterSubmit = async (data: SemesterSheetData) => {
    try {
      if (editingSemester) {
        const result = await updateSemester(editingSemester.id, data)
        if (!result.success) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Berhasil', description: 'Semester diperbarui' })
      } else {
        const result = await createSemester(data)
        if (!result.success) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Berhasil', description: 'Semester ditambahkan' })
      }
      setSemesterSheetOpen(false)
      setEditingSemester(null)
      await reloadSemesters()
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan semester', variant: 'destructive' })
    }
  }

  const handleSemesterDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus semester ini?')) return
    const result = await deleteSemester(id)
    if (!result.success) {
      toast({ title: 'Gagal', description: result.error || 'Tidak bisa menghapus semester', variant: 'destructive' })
      return
    }
    toast({ title: 'Berhasil', description: 'Semester dihapus' })
    await reloadSemesters()
  }

  const reloadSemesters = async () => {
    const data = await import('@/actions/academic').then(m => m.fetchAcademic())
    setSemesters(data.semesters)
  }

  // SUBJECT HANDLERS
  const handleSubjectSubmit = async (data: SubjectSheetData) => {
    try {
      if (editingSubject) {
        const result = await updateSubject(editingSubject.id, data)
        if (!result.success) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Berhasil', description: 'Mapel diperbarui' })
      } else {
        const result = await createSubject(data)
        if (!result.success) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
          return
        }
        toast({ title: 'Berhasil', description: 'Mapel ditambahkan' })
      }
      setSubjectSheetOpen(false)
      setEditingSubject(null)
      await reloadSubjects()
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan mapel', variant: 'destructive' })
    }
  }

  const handleSubjectDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus mapel ini?')) return
    const result = await deleteSubject(id)
    if (!result.success) {
      toast({ title: 'Gagal', description: result.error || 'Tidak bisa menghapus mapel', variant: 'destructive' })
      return
    }
    toast({ title: 'Berhasil', description: 'Mapel dihapus' })
    await reloadSubjects()
  }

  const reloadSubjects = async () => {
    const data = await fetchSubjects()
    setSubjects(data as SubjectEntity[])
  }

  // ==================== COLUMNS ====================

  const classColumns = React.useMemo(
    () => buildClassColumns(
      (id) => { setEditingClass(classes.find(c => c.id === id) || null); setClassSheetOpen(true) },
      handleClassDelete
    ),
    [classes, handleClassDelete]
  )

  const majorColumns = React.useMemo(
    () => buildMajorColumns(
      (id) => { setEditingMajor(majors.find(m => m.id === id) || null); setMajorSheetOpen(true) },
      handleMajorDelete
    ),
    [majors, handleMajorDelete]
  )

  const semesterColumns = React.useMemo(
    () => buildSemesterColumns(
      (id) => { setEditingSemester(semesters.find(s => s.id === id) || null); setSemesterSheetOpen(true) },
      handleSemesterDelete
    ),
    [semesters, handleSemesterDelete]
  )

  const subjectColumns = React.useMemo(
    () => buildSubjectColumns(
      (id) => { setEditingSubject(subjects.find(s => s.id === id) || null); setSubjectSheetOpen(true) },
      handleSubjectDelete
    ),
    [subjects, handleSubjectDelete]
  )

  return (
    <>
      <Tabs defaultValue="kelas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="kelas">Kelas</TabsTrigger>
          <TabsTrigger value="jurusan">Jurusan</TabsTrigger>
          <TabsTrigger value="tahun">Tahun Ajaran</TabsTrigger>
          <TabsTrigger value="mapel">Mapel</TabsTrigger>
        </TabsList>

        {/* KELAS TAB */}
        <TabsContent value="kelas" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Kelas</div>
              <div className="text-2xl font-bold">{classes.length}</div>
            </div>
            <RequirePermission permission="classes.manage">
              <Button className="gap-2" onClick={() => { setEditingClass(null); setClassSheetOpen(true) }}>
                <Plus className="h-4 w-4" /> Tambah Kelas
              </Button>
            </RequirePermission>
          </div>
          <DataTable columns={classColumns} data={classes} searchKey="name" exportFilename="data-kelas-sistren" />
        </TabsContent>

        {/* JURUSAN TAB */}
        <TabsContent value="jurusan" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Jurusan</div>
              <div className="text-2xl font-bold">{majors.length}</div>
            </div>
            <RequirePermission permission="majors.manage">
              <Button className="gap-2" onClick={() => { setEditingMajor(null); setMajorSheetOpen(true) }}>
                <Plus className="h-4 w-4" /> Tambah Jurusan
              </Button>
            </RequirePermission>
          </div>
          <DataTable columns={majorColumns} data={majors} searchKey="name" exportFilename="data-jurusan-sistren" />
        </TabsContent>

        {/* TAHUN AJARAN TAB */}
        <TabsContent value="tahun" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Semester</div>
              <div className="text-2xl font-bold">{semesters.length}</div>
            </div>
            <RequirePermission permission="semesters.manage">
              <Button className="gap-2" onClick={() => { setEditingSemester(null); setSemesterSheetOpen(true) }}>
                <Plus className="h-4 w-4" /> Tambah Semester
              </Button>
            </RequirePermission>
          </div>
          <DataTable columns={semesterColumns} data={semesters} searchKey="name" exportFilename="data-semester-sistren" />
        </TabsContent>

        {/* MAPEL TAB */}
        <TabsContent value="mapel" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Mapel</div>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </div>
            <RequirePermission permission="subjects.manage">
              <Button className="gap-2" onClick={() => { setEditingSubject(null); setSubjectSheetOpen(true) }}>
                <Plus className="h-4 w-4" /> Tambah Mapel
              </Button>
            </RequirePermission>
          </div>
          <DataTable columns={subjectColumns} data={subjects} searchKey="name" exportFilename="data-mapel-sistren" />
        </TabsContent>
      </Tabs>

      {/* SHEETS */}
      <ClassSheet
        key={editingClass?.id || 'new-class'}
        open={classSheetOpen}
        onOpenChange={(open) => { setClassSheetOpen(open); if (!open) setEditingClass(null) }}
        onSubmit={handleClassSubmit}
        initialData={editingClass || undefined}
      />
      <MajorSheet
        key={editingMajor?.id || 'new-major'}
        open={majorSheetOpen}
        onOpenChange={(open) => { setMajorSheetOpen(open); if (!open) setEditingMajor(null) }}
        onSubmit={handleMajorSubmit}
        initialData={editingMajor || undefined}
      />
      <SemesterSheet
        key={editingSemester?.id || 'new-semester'}
        open={semesterSheetOpen}
        onOpenChange={(open) => { setSemesterSheetOpen(open); if (!open) setEditingSemester(null) }}
        onSubmit={handleSemesterSubmit}
        initialData={editingSemester || undefined}
      />
      <SubjectSheet
        key={editingSubject?.id || 'new-subject'}
        open={subjectSheetOpen}
        onOpenChange={(open) => { setSubjectSheetOpen(open); if (!open) setEditingSubject(null) }}
        onSubmit={handleSubjectSubmit}
        initialData={editingSubject || undefined}
        classes={classes}
        majors={majors}
      />
    </>
  )
}

// ==================== COLUMN BUILDERS ====================

function buildClassColumns(onEdit: (id: number) => void, onDelete: (id: number) => void): ColumnDef<ClassEntity>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Nama Kelas',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'code',
      header: 'Kode',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const cls = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><DotsThree className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <RequirePermission permission="classes.manage">
                <DropdownMenuItem onClick={() => onEdit(cls.id)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="classes.manage">
                <DropdownMenuItem onClick={() => onDelete(cls.id)} className="cursor-pointer text-destructive">
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

function buildMajorColumns(onEdit: (id: number) => void, onDelete: (id: number) => void): ColumnDef<MajorEntity>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Nama Jurusan',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const major = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><DotsThree className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <RequirePermission permission="majors.manage">
                <DropdownMenuItem onClick={() => onEdit(major.id)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="majors.manage">
                <DropdownMenuItem onClick={() => onDelete(major.id)} className="cursor-pointer text-destructive">
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

function buildSemesterColumns(onEdit: (id: number) => void, onDelete: (id: number) => void): ColumnDef<SemesterEntity>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Nama',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'academicYear',
      header: 'Tahun Ajaran',
    },
    {
      id: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const sem = row.original
        if (sem.isActive) {
          return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Aktif</span>
        }
        return <span className="text-xs text-muted-foreground">Tidak Aktif</span>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const sem = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><DotsThree className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <RequirePermission permission="semesters.manage">
                <DropdownMenuItem onClick={() => onEdit(sem.id)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="semesters.manage">
                <DropdownMenuItem onClick={() => onDelete(sem.id)} className="cursor-pointer text-destructive">
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

function buildSubjectColumns(onEdit: (id: number) => void, onDelete: (id: number) => void): ColumnDef<SubjectEntity>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Nama Mapel',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'code',
      header: 'Kode',
    },
    {
      accessorKey: 'className',
      header: 'Kelas',
      cell: ({ row }) => row.original.className || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'majorName',
      header: 'Jurusan',
      cell: ({ row }) => row.original.majorName || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'credits',
      header: 'SKS',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const subj = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><DotsThree className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <RequirePermission permission="subjects.manage">
                <DropdownMenuItem onClick={() => onEdit(subj.id)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="subjects.manage">
                <DropdownMenuItem onClick={() => onDelete(subj.id)} className="cursor-pointer text-destructive">
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