import { getClasses, getMajors, getSemesters, getSubjects } from "@/actions/academic";
import { getPublicEvents } from "@/actions/calendar";
import { AcademicOverviewClient } from "@/features/academic/AcademicOverviewClient";
import { StudentAcademicClient } from "@/features/academic/StudentAcademicClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";

export default async function AcademicOverviewPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  const roleLevel = ctx?.roleLevel ?? 0;

  // Siswa (level 40) — student academic view
  if (roleLevel === 40) {
    const calendarEvents = await getPublicEvents({});
    return (
      <StudentAcademicClient
        userId={session.userId}
        calendarEvents={calendarEvents}
      />
    );
  }

  // Guru/Admin (level >= 60) — admin overview
  await verifySession(); // re-verify for minimum level

  const [classList, subjectList, semesterList, majorList] = await Promise.all([
    getClasses(),
    getSubjects(),
    getSemesters(),
    getMajors(),
  ]);

  const activeSemester = semesterList.find((s) => s.isActive);

  // If teacher (level 60), get assigned subjects
  const assignedSubjectIds: number[] = [];
  if (roleLevel === 60) {
    const { getAssignments } = await import("@/actions/academic");
    const assignments = await getAssignments();
    const filtered = assignments.filter((a) => a.teacherId === session.userId);
    assignedSubjectIds.push(...filtered.map((a) => a.subjectId));
  }

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
        subjectCount={subjectList.length}
        semesterCount={semesterList.length}
        majorCount={majorList.length}
        activeSemesterName={activeSemester?.name}
        activeSemesterYear={activeSemester?.academicYear}
        classes={classList}
        subjects={subjectList}
        semesters={semesterList}
        roleLevel={roleLevel}
        assignedSubjectIds={assignedSubjectIds}
      />
    </div>
  );
}
