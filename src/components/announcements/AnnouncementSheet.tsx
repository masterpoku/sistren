'use client'

import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface AnnouncementSheetData {
  title: string
  description?: string
  content: string
  category?: string
  priority?: 'normal' | 'important' | 'urgent'
  publishedAt?: string | null
}

interface AnnouncementSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AnnouncementSheetData) => Promise<void>
  initialData?: {
    id: number
    title: string
    description?: string | null
    content: string | null
    category?: string | null
    priority?: 'normal' | 'important' | 'urgent' | null
    publishedAt?: Date | string | null
  }
}

const CATEGORIES = [
  { value: 'umum', label: 'Umum' },
  { value: 'akademik', label: 'Akademik' },
  { value: 'keuangan', label: 'Keuangan' },
  { value: 'kegiatan', label: 'Kegiatan' },
]

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Penting' },
  { value: 'urgent', label: 'Urgent' },
]

export function AnnouncementSheet({ open, onOpenChange, onSubmit, initialData }: AnnouncementSheetProps) {
  const [loading, setLoading] = React.useState(false)
  const [title, setTitle] = React.useState(initialData?.title || '')
  const [description, setDescription] = React.useState(initialData?.description || '')
  const [content, setContent] = React.useState(initialData?.content || '')
  const [category, setCategory] = React.useState(initialData?.category || 'umum')
  const [priority, setPriority] = React.useState<'normal' | 'important' | 'urgent'>(initialData?.priority || 'normal')
  const [publishedAt, setPublishedAt] = React.useState('')

  const toDateString = (val: string | Date | null | undefined) => {
    if (!val) return ''
    if (typeof val === 'string') return val.split('T')[0]
    return val.toISOString().split('T')[0]
  }

  React.useEffect(() => {
    if (open) {
      setTitle(initialData?.title || '')
      setDescription(initialData?.description || '')
      setContent(initialData?.content || '')
      setCategory(initialData?.category || 'umum')
      setPriority(initialData?.priority || 'normal')
      setPublishedAt(toDateString(initialData?.publishedAt))
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
        category,
        priority,
        publishedAt: publishedAt || null,
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
            <SheetTitle>{initialData ? 'Edit Pengumuman' : 'Buat Pengumuman'}</SheetTitle>
            <SheetDescription>
              {initialData ? 'Perbarui data pengumuman.' : 'Buat pengumuman baru untuk siswa dan guru.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Judul *</Label>
              <Input
                id="ann-title"
                placeholder="Contoh: Libur Semester Genap"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ann-description">Deskripsi Singkat</Label>
              <Input
                id="ann-description"
                placeholder="Ringkasan singkat pengumuman"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ann-content">Isi Pengumuman *</Label>
              <textarea
                id="ann-content"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tulis isi pengumuman di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ann-category">Kategori</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="ann-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ann-priority">Prioritas</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as 'normal' | 'important' | 'urgent')}>
                  <SelectTrigger id="ann-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ann-published">Tanggal Publikasi</Label>
              <Input
                id="ann-published"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
              {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Publikasi'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}