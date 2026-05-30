import { getClasses, getSubjects, getSemesters } from '@/actions/academic';
import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import { GradesPageClient } from './grades-client';

export default async function GradesPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  const roleLevel = ctx?.roleLevel ?? 0;
  const userId = session.userId;

  const [classList, subjectList, semesterList] = await Promise.all([
    getClasses(),
    getSubjects(),
    getSemesters(),
  ]);

  // If teacher (level 60), get assigned subjects
  const assignedSubjectIds: number[] = [];
  if (roleLevel === 60) {
    const { getAssignments } = await import('@/actions/academic');
    const assignments = await getAssignments();
    const filtered = assignments.filter((a) => a.teacherId === userId);
    assignedSubjectIds.push(...filtered.map((a) => a.subjectId));
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Input Nilai</h1>
        <p className="text-muted-foreground">
          Kelola nilai pengetahuan, keterampilan, dan sikap siswa.
        </p>
      </div>

      <GradesPageClient
        classes={classList}
        subjects={subjectList}
        semesters={semesterList}
        roleLevel={roleLevel}
        assignedSubjectIds={assignedSubjectIds}
      />
    </div>
  );
}
