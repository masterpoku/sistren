import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/verify-session';
import { getAuthContext } from '@/lib/auth/permissions';
import { db } from '@/lib/db';
import {
  users,
  roles,
  enrollments,
  semesters,
  teacherClassSubjects,
  announcements,
} from '@/lib/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { DashboardClient } from './components';

export default async function DashboardPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) redirect('/unauthorized');

  const roleLevel = ctx.roleLevel;

  let stats: {
    totalStudents?: number;
    totalTeachers?: number;
    activeEnrollments?: number;
    pendingAnnouncements?: number;
    assignedClasses?: number;
    assignedSubjects?: number;
    ownEnrollmentStatus?: string;
  } = {};

  if (roleLevel >= 80) {
    // Admin: count students (role level 40), teachers (role level 60), active enrollments, published announcements
    const [studentRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(roles.level, 40), isNull(users.deletedAt)));
    const [teacherRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(and(eq(roles.level, 60), isNull(users.deletedAt)));
    const [activeRow] = await db
      .select({ count: sql<bigint>`count(*)` })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.status, 'active' as const),
          isNull(enrollments.deletedAt)
        )
      )
      .limit(1);
    const [announcementRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(announcements)
      .where(isNull(announcements.deletedAt));

    stats = {
      totalStudents: Number(studentRow?.count ?? 0),
      totalTeachers: Number(teacherRow?.count ?? 0),
      activeEnrollments: Number(activeRow?.count ?? 0),
      pendingAnnouncements: Number(announcementRow?.count ?? 0),
    };
  } else if (roleLevel === 60) {
    // Guru: count assigned classes and subjects for this teacher this semester
    const activeSemester = await db
      .select({ id: semesters.id })
      .from(semesters)
      .where(eq(semesters.isActive, true))
      .limit(1);

    if (activeSemester.length > 0) {
      const semesterId = activeSemester[0].id;
      const classRows = await db
        .select({ count: sql<number>`count(distinct class_id)` })
        .from(teacherClassSubjects)
        .where(
          and(
            eq(teacherClassSubjects.teacherId, session.userId),
            eq(teacherClassSubjects.semesterId, semesterId),
            isNull(teacherClassSubjects.deletedAt)
          )
        );
      const subjectRows = await db
        .select({ count: sql<number>`count(distinct subject_id)` })
        .from(teacherClassSubjects)
        .where(
          and(
            eq(teacherClassSubjects.teacherId, session.userId),
            eq(teacherClassSubjects.semesterId, semesterId),
            isNull(teacherClassSubjects.deletedAt)
          )
        );

      stats = {
        assignedClasses: Number(classRows[0]?.count ?? 0),
        assignedSubjects: Number(subjectRows[0]?.count ?? 0),
      };
    }
  } else if (roleLevel === 40) {
    // Siswa: own enrollment status
    const [enrollmentRow] = await db
      .select({ status: enrollments.status })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, session.userId),
          isNull(enrollments.deletedAt)
        )
      )
      .limit(1);

    if (enrollmentRow) {
      stats = { ownEnrollmentStatus: enrollmentRow.status ?? 'unknown' };
    }
  }

  return (
    <DashboardClient
      name={session.name}
      roleLevel={ctx?.roleLevel ?? 0}
      stats={stats}
    />
  );
}
