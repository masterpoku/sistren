import { verifyRoleLevel } from '@/lib/auth/verify-session';
import {
  getClasses,
  getMajors,
  getSubjects,
  getSemesters,
} from '@/actions/academic';
import { AcademicOverviewClient } from './AcademicOverviewClient';

export default async function AcademicOverviewPage() {
  await verifyRoleLevel(60);

  const [classList, majorList, subjectList, semesterList] = await Promise.all([
    getClasses(),
    getMajors(),
    getSubjects(),
    getSemesters(),
  ]);

  const activeSemester = semesterList.find((s) => s.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academic Overview</h1>
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
