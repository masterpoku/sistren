import { fetchAcademic } from '@/actions/academic'
import { getSubjects } from '@/lib/db/queries'
import { AcademicTabs } from '@/components/academic/AcademicTabs'

export default async function AcademicPage() {
  const [academicData, subjectEntities] = await Promise.all([
    fetchAcademic(),
    getSubjects(),
  ])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Akademik</h1>
          <p className="text-muted-foreground">Manajemen kelas, jurusan, semester, dan mata pelajaran</p>
        </div>
      </div>

      <AcademicTabs
        classes={academicData.classes}
        majors={academicData.majors}
        semesters={academicData.semesters}
        subjectEntities={subjectEntities as any}
      />
    </div>
  )
}