'use client'

import { useEffect, useState } from 'react'
import { fetchAcademic } from '@/actions/academic'
import { fetchGrades } from '@/actions/grades'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus, GraduationCap, CheckCircle } from 'phosphor-react'

interface GradeData {
  id: number
  score: string | null
  grade: string | null
  predicate: string | null
  subject?: { name: string; code: string }
  semester?: { name: string }
}

interface AcademicData {
  classes: { id: number; name: string; level?: number | null }[]
  majors: { id: number; name: string; code?: string | null }[]
  semesters: { id: number; name: string; isActive: boolean | null }[]
}

export default function GradesPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AcademicData | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [grades, setGrades] = useState<GradeData[]>([])

  useEffect(() => {
    async function load() {
      try {
        const academicData = await fetchAcademic()
        setData(academicData)
        
        // Set first active semester as default
        const activeSemester = academicData.semesters.find(s => s.isActive)
        if (activeSemester) {
          setSelectedSemester(activeSemester.id)
        }
      } catch (error) {
        console.error('Failed to load:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadGrades() {
      if (selectedSemester) {
        try {
          const gradeData = await fetchGrades(undefined, selectedSemester)
          setGrades(gradeData)
        } catch (error) {
          console.error('Failed to load grades:', error)
          setGrades([])
        }
      }
    }
    loadGrades()
  }, [selectedSemester])

  const gradedCount = grades.filter(g => g.grade).length
  const avgScore = grades.length > 0
    ? grades.filter(g => g.score).reduce((sum, g) => sum + parseFloat(g.score || '0'), 0) / grades.filter(g => g.score).length
    : 0

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Input Nilai</h1>
          <p className="text-muted-foreground">
            Kartu Hasil Studi (KHS) dan input nilai siswa
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Input Nilai Baru
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {data?.semesters.map((semester) => (
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
                <div className="text-2xl font-bold">
                  {grades.length}
                </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Daftar Mata Pelajaran</CardTitle>
              <CardDescription>
                {selectedSemester 
                  ? `Semester: ${data?.semesters.find(s => s.id === selectedSemester)?.name}`
                  : 'Pilih semester untuk melihat nilai'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {grades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {selectedSemester ? 'Belum ada nilai untuk semester ini' : 'Pilih semester untuk melihat nilai'}
                  </div>
                ) : (
                  grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {grade.subject?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {grade.subject?.code}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">{grade.grade || '-'}</div>
                          <div className="text-xs text-muted-foreground">
                            {grade.predicate || 'Belum ada'}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}