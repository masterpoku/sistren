'use client'

import { useEffect, useState } from 'react'
import { fetchAcademic } from '@/actions/academic'
import { fetchEnrollments } from '@/actions/enrollments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Users } from 'phosphor-react'

interface Enrollment {
  id: number
  studentId: number
  classId: number
  semesterId: number
  student?: { name: string; email: string }
  semester?: { name: string }
  class?: { name: string }
}

interface AcademicData {
  classes: { id: number; name: string; level?: number | null }[]
  majors: { id: number; name: string; code?: string | null }[]
  semesters: { id: number; name: string; isActive: boolean | null }[]
}

export default function EnrollmentsPage() {
  const [loading, setLoading] = useState(true)
  const [academicData, setAcademicData] = useState<AcademicData | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    async function load() {
      try {
        const [academic, enrollmentData] = await Promise.all([
          fetchAcademic(),
          fetchEnrollments().catch(() => []),
        ])
        setAcademicData(academic)
        setEnrollments(enrollmentData)
      } catch (error) {
        console.error('Failed to load:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Kelola Pendaftaran</h1>
          <p className="text-muted-foreground">
            Kartu Rencana Studi (KRS) siswa per semester
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pendaftaran
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
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
                <div className="text-2xl font-bold">
                  {academicData?.semesters.filter(s => s.isActive).length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {academicData?.semesters.map((semester) => (
              <Card key={semester.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{semester.name}</CardTitle>
                      <CardDescription>
                        {semester.isActive ? 'Semester aktif' : 'Non-aktif'}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Lihat Siswa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {enrollments.filter(e => e.semesterId === semester.id).length} siswa terdaftar
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}