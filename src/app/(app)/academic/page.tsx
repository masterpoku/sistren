import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import {
  getClasses,
  getMajors,
  getSubjects,
  getSemesters,
} from '@/actions/academic';
import { AcademicOverviewClient } from '@/features/academic/AcademicOverviewClient';
import { StudentAcademicClient } from '@/features/academic/StudentAcademicClient';

export default async function AcademicOverviewPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  const roleLevel = ctx?.roleLevel ?? 0;

  // Siswa (level 40) — student academic view
  if (roleLevel === 40) {
    return <StudentAcademicClient />;
  }

  // Guru/Admin (level >= 60) — admin overview
  await verifySession(); // re-verify for minimum level

  const [classList, majorList, subjectList, semesterList] = await Promise.all([
    getClasses(),
    getMajors(),
    getSubjects(),
    getSemesters(),
  ]);

  const activeSemester = semesterList.find((s) => s.isActive);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Overview</h1>
        <p className="text-muted-foreground">
          Ringkasan data akademik sekolah.
        </p>
      </div>

      <AcademicOverviewClient
        classCount={classList.length}
        majorCount={majorList.length}
        subjectCount={subjectList.length}
        semesterCount={semesterList.length}
        activeSemesterName={activeSemester?.name}
        activeSemesterYear={activeSemester?.academicYear}
      />
    </div>
  );
}
