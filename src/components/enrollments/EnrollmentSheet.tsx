'use client'

import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface EnrollmentSheetData {
  studentId: number
  classId: number
  semesterId: number
}

interface StudentOption { id: number; name: string; email: string }
interface ClassOption { id: number; name: string; code: string }
interface SemesterOption { id: number; name: string; academicYear: string; isActive: boolean | null }

interface EnrollmentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: EnrollmentSheetData) => Promise<void>
  students: StudentOption[]
  classes: ClassOption[]
  semesters: SemesterOption[]
  initialData?: {
    id: number
    studentId: number
    classId: number
    semesterId: number
  }
}

export function EnrollmentSheet({ open, onOpenChange, onSubmit, students, classes, semesters, initialData }: EnrollmentSheetProps) {
  const [loading, setLoading] = React.useState(false)
  const [studentId, setStudentId] = React.useState<string>(initialData ? String(initialData.studentId) : '')
  const [classId, setClassId] = React.useState<string>(initialData ? String(initialData.classId) : '')
  const [semesterId, setSemesterId] = React.useState<string>(initialData ? String(initialData.semesterId) : '')

  React.useEffect(() => {
    if (open) {
      setStudentId(initialData ? String(initialData.studentId) : '')
      setClassId(initialData ? String(initialData.classId) : '')
      setSemesterId(initialData ? String(initialData.semesterId) : '')
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !classId || !semesterId) return
    setLoading(true)
    try {
      await onSubmit({ studentId: Number(studentId), classId: Number(classId), semesterId: Number(semesterId) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="pb-4">
            <SheetTitle>{initialData ? 'Edit Pendaftaran' : 'Tambah Pendaftaran'}</SheetTitle>
            <SheetDescription>
              {initialData ? 'Perbarui data pendaftaran siswa.' : 'Daftarkan siswa ke kelas dan semester.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="enr-student">Siswa *</Label>
              <Select
                value={studentId}
                onValueChange={(v) => setStudentId(v)}
              >
                <SelectTrigger id="enr-student">
                  <SelectValue placeholder="Pilih siswa..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} — {s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enr-class">Kelas *</Label>
              <Select
                value={classId}
                onValueChange={(v) => setClassId(v)}
              >
                <SelectTrigger id="enr-class">
                  <SelectValue placeholder="Pilih kelas..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enr-semester">Semester *</Label>
              <Select
                value={semesterId}
                onValueChange={(v) => setSemesterId(v)}
              >
                <SelectTrigger id="enr-semester">
                  <SelectValue placeholder="Pilih semester..." />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.academicYear}){s.isActive ? ' — Aktif' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || !studentId || !classId || !semesterId}>
              {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Daftarkan'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}