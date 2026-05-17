'use client'

import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface SubjectSheetData {
  name: string
  code?: string
  classId: number
  majorId?: number
  credits?: number
  description?: string
}

interface SubjectSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: SubjectSheetData) => Promise<void>
  initialData?: { id: number; name: string; code?: string | null; classId: number; majorId?: number | null; credits?: number | null; description?: string | null }
  classes: { id: number; name: string }[]
  majors: { id: number; name: string }[]
}

export function SubjectSheet({ open, onOpenChange, onSubmit, initialData, classes, majors }: SubjectSheetProps) {
  const [loading, setLoading] = React.useState(false)
  const [name, setName] = React.useState(initialData?.name || '')
  const [code, setCode] = React.useState(initialData?.code || '')
  const [classId, setClassId] = React.useState<number>(initialData?.classId || 0)
  const [majorId, setMajorId] = React.useState<number | undefined>(initialData?.majorId || undefined)
  const [credits, setCredits] = React.useState(initialData?.credits?.toString() || '')
  const [description, setDescription] = React.useState(initialData?.description || '')

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name || '')
      setCode(initialData?.code || '')
      setClassId(initialData?.classId || 0)
      setMajorId(initialData?.majorId || undefined)
      setCredits(initialData?.credits?.toString() || '')
      setDescription(initialData?.description || '')
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId) return
    setLoading(true)
    try {
      await onSubmit({
        name,
        code: code || undefined,
        classId,
        majorId: majorId || undefined,
        credits: credits ? Number(credits) : undefined,
        description: description || undefined,
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
            <SheetTitle>{initialData ? 'Edit Mapel' : 'Tambah Mapel'}</SheetTitle>
            <SheetDescription>
              {initialData ? 'Perbarui data mata pelajaran.' : 'Tambah mata pelajaran baru.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subj-name">Nama Mapel</Label>
              <Input
                id="subj-name"
                placeholder="Contoh: Matematika Diskrit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subj-code">Kode Mapel</Label>
              <Input
                id="subj-code"
                placeholder="Contoh: TK102"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subj-class">Kelas</Label>
              <Select value={classId ? String(classId) : ''} onValueChange={(v) => setClassId(Number(v))} required>
                <SelectTrigger id="subj-class">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subj-major">Jurusan (Opsional)</Label>
              <Select value={majorId ? String(majorId) : ''} onValueChange={(v) => setMajorId(v ? Number(v) : undefined)}>
                <SelectTrigger id="subj-major">
                  <SelectValue placeholder="Pilih jurusan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {majors.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subj-credits">SKS</Label>
              <Input
                id="subj-credits"
                type="number"
                min="0"
                placeholder="Contoh: 3"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subj-desc">Deskripsi</Label>
              <Input
                id="subj-desc"
                placeholder="Deskripsi singkat mapel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || !classId}>
              {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Tambah'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}