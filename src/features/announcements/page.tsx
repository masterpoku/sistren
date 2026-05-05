'use client'

import { useEffect, useState } from 'react'
import { fetchAnnouncements } from '@/actions/announcements'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell } from 'phosphor-react'

interface Announcement {
  id: number
  title: string
  content: string | null
  category: string | null
  authorId: number | null
  publishedAt: Date | null
  createdAt: Date | null
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await fetchAnnouncements()
        setAnnouncements(data)
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAnnouncements()
  }, [])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Pengumuman</h1>
        <p className="text-muted-foreground">Informasi terbaru dari sekolah.</p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Belum ada pengumuman</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Pengumuman akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                  {announcement.title}
                </CardTitle>
                <Badge variant="outline" className="capitalize">
                  {announcement.category || 'Umum'}
                </Badge>
              </CardHeader>
              <CardContent>
                {announcement.content && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {announcement.content}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {announcement.publishedAt
                      ? new Date(announcement.publishedAt).toLocaleDateString(
                          'id-ID',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )
                      : announcement.createdAt
                        ? new Date(announcement.createdAt).toLocaleDateString(
                            'id-ID',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )
                        : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}