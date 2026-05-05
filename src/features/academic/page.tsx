'use client'

import { useEffect, useState } from 'react'
import { fetchAcademic } from '@/actions/academic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Users, Calendar } from 'phosphor-react'

interface AcademicData {
  classes: { id: number; name: string; level?: number | null }[]
  majors: { id: number; name: string; code?: string | null }[]
  semesters: { id: number; name: string; isActive: boolean | null; startDate: Date | null }[]
}

export default function AcademicPage() {
  const [data, setData] = useState<AcademicData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAcademic() {
      try {
        const result = await fetchAcademic()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch academic data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAcademic()
  }, [])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Akademik</h1>
          <p className="text-muted-foreground">Data akademik dan nilai siswa</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.classes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jurusan</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.majors.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Semester</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.semesters.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Kelas</CardTitle>
                <CardDescription>Daftar kelas yang tersedia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.classes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada kelas.</p>
                  ) : (
                    data.classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <span className="font-medium">{cls.name}</span>
                        {cls.level && (
                          <span className="text-sm text-muted-foreground">
                            Level {cls.level}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jurusan</CardTitle>
                <CardDescription>Daftar jurusan/program keahlian</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.majors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada jurusan.</p>
                  ) : (
                    data.majors.map((major) => (
                      <div
                        key={major.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <span className="font-medium">{major.name}</span>
                        {major.code && (
                          <span className="text-sm text-muted-foreground">
                            {major.code}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Semester</CardTitle>
                <CardDescription>Daftar semester ajaran</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.semesters.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-full">
                      Belum ada semester.
                    </p>
                  ) : (
                    data.semesters.map((sem) => (
                      <div
                        key={sem.id}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{sem.name}</span>
                          {sem.isActive && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Aktif
                            </span>
                          )}
                        </div>
                        {sem.startDate && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(sem.startDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Gagal memuat data akademik.</p>
        </div>
      )}
    </div>
  )
}