'use client'

import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export interface SemesterSheetData {
  name: string
  academicYear: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}

interface SemesterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: SemesterSheetData) => Promise<void>
  initialData?: { id: number; name: string; academicYear: string; startDate?: string | Date | null; endDate?: string | Date | null; isActive: boolean | null }
}

export function SemesterSheet({ open, onOpenChange, onSubmit, initialData }: SemesterSheetProps) {
  const toDateString = (val: string | Date | null | undefined) => {
    if (!val) return ''
    if (typeof val === 'string') return val.split('T')[0]
    return val.toISOString().split('T')[0]
  }

  const initialStart = toDateString(initialData?.startDate)
  const initialEnd = toDateString(initialData?.endDate)
  const [loading, setLoading] = React.useState(false)
  const [name, setName] = React.useState(initialData?.name || '')
  const [academicYear, setAcademicYear] = React.useState(initialData?.academicYear || '')
  const [startDate, setStartDate] = React.useState(initialStart)
  const [endDate, setEndDate] = React.useState(initialEnd)
  const [isActive, setIsActive] = React.useState(initialData?.isActive || false)

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name || '')
      setAcademicYear(initialData?.academicYear || '')
      setStartDate(toDateString(initialData?.startDate))
      setEndDate(toDateString(initialData?.endDate))
      setIsActive(initialData?.isActive || false)
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        name,
        academicYear,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="pb-4">
            <SheetTitle>{initialData ? 'Edit Semester' : 'Tambah Semester'}</SheetTitle>
            <SheetDescription>
              {initialData ? 'Perbarui data semester.' : 'Tambah semester ajaran baru.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sem-name">Nama Semester</Label>
              <Input
                id="sem-name"
                placeholder="Contoh: Semester 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sem-year">Tahun Ajaran</Label>
              <Input
                id="sem-year"
                placeholder="Contoh: 2025/2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sem-start">Tanggal Mulai</Label>
              <Input
                id="sem-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sem-end">Tanggal Selesai</Label>
              <Input
                id="sem-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sem-active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <Label htmlFor="sem-active" className="font-normal">
                Jadikan semester aktif
              </Label>
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Tambah'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}