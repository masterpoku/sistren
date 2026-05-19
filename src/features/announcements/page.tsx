'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, publishAnnouncement, unpublishAnnouncement } from '@/actions/announcements'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Megaphone,
} from 'phosphor-react'
import { useToast } from '@/hooks/use-toast'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { AnnouncementSheet, AnnouncementSheetData } from '@/components/announcements/AnnouncementSheet'

interface Announcement {
  id: number
  title: string
  description: string | null
  content: string | null
  category: string | null
  priority: 'normal' | 'important' | 'urgent' | null
  authorId: number | null
  publishedAt: Date | string | null
  createdAt: Date | string | null
  updatedAt: Date | string | null
  deletedAt: Date | string | null
}

const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  normal: 'default',
  important: 'secondary',
  urgent: 'destructive',
}

const CATEGORY_LABELS: Record<string, string> = {
  umum: 'Umum',
  akademik: 'Akademik',
  keuangan: 'Keuangan',
  kegiatan: 'Kegiatan',
}

export default function AnnouncementsPage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editingAnn, setEditingAnn] = React.useState<Announcement | null>(null)

  const loadAnnouncements = React.useCallback(async () => {
    try {
      const data = await fetchAnnouncements()
      setAnnouncements(data as Announcement[])
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat pengumuman', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  const handleSubmit = async (data: AnnouncementSheetData) => {
    if (editingAnn) {
      const result = await updateAnnouncement(editingAnn.id, data)
      if (!result.success) {
        toast({ title: 'Error', description: result.error || 'Gagal memperbarui', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: 'Pengumuman diperbarui' })
    } else {
      const result = await createAnnouncement(data)
      if (!result.success) {
        toast({ title: 'Error', description: result.error || 'Gagal membuat', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: 'Pengumuman dipublikasi' })
    }
    setSheetOpen(false)
    setEditingAnn(null)
    await loadAnnouncements()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus pengumuman ini?')) return
    const result = await deleteAnnouncement(id)
    if (!result.success) {
      toast({ title: 'Gagal', description: result.error || 'Tidak bisa menghapus', variant: 'destructive' })
      return
    }
    toast({ title: 'Berhasil', description: 'Pengumuman dihapus' })
    await loadAnnouncements()
  }

  const handlePublishToggle = async (ann: Announcement) => {
    const isPublished = !!ann.publishedAt
    const result = isPublished
      ? await unpublishAnnouncement(ann.id)
      : await publishAnnouncement(ann.id)
    if (!result.success) {
      toast({ title: 'Gagal', description: result.error || 'Gagal mengubah status', variant: 'destructive' })
      return
    }
    toast({ title: 'Berhasil', description: isPublished ? 'Publikasi dibatalkan' : 'Pengumuman dipublikasi' })
    await loadAnnouncements()
  }

  const columns: ColumnDef<Announcement>[] = React.useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => {
        const cat = row.getValue('category') as string | null
        return cat ? <Badge variant="outline">{CATEGORY_LABELS[cat] || cat}</Badge> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: 'priority',
      header: 'Prioritas',
      cell: ({ row }) => {
        const p = (row.getValue('priority') as string) || 'normal'
        return <Badge variant={PRIORITY_VARIANTS[p] || 'default'}>{p.charAt(0).toUpperCase() + p.slice(1)}</Badge>
      },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Status',
      cell: ({ row }) => {
        const published = row.getValue('publishedAt')
        if (published) {
          return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Terbit</span>
        }
        return <span className="text-xs text-muted-foreground">Draf</span>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const ann = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><DotsThree className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <RequirePermission permission="announcements.update">
                <DropdownMenuItem
                  onClick={() => { setEditingAnn(ann); setSheetOpen(true) }}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="announcements.publish">
                <DropdownMenuItem
                  onClick={() => handlePublishToggle(ann)}
                  className="cursor-pointer"
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  {ann.publishedAt ? 'Batalkan Publikasi' : 'Publikasi'}
                </DropdownMenuItem>
              </RequirePermission>
              <RequirePermission permission="announcements.delete">
                <DropdownMenuItem
                  onClick={() => handleDelete(ann.id)}
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
  ], [handleDelete, handlePublishToggle])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Pengumuman</h1>
          <p className="text-muted-foreground">Informasi terbaru dari sekolah.</p>
        </div>
        <RequirePermission permission="announcements.create">
          <Button className="gap-2" onClick={() => { setEditingAnn(null); setSheetOpen(true) }}>
            <Plus className="h-4 w-4" /> Buat Pengumuman
          </Button>
        </RequirePermission>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={announcements} searchKey="title" exportFilename="pengumuman-sistren" />
      )}

      <AnnouncementSheet
        key={editingAnn?.id || 'new-announcement'}
        open={sheetOpen}
        onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditingAnn(null) }}
        onSubmit={handleSubmit}
        initialData={editingAnn || undefined}
      />
    </div>
  )
}