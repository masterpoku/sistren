import { and, eq, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  getRecentActivities,
  getRecentAnnouncements,
  getRegistrationStatsByMonth,
  getStudentCurrentGpa,
  getStudentGpaHistory,
  getStudentSppStatus,
  getStudentSubjectCount,
  getTeacherClassAverages,
  getTeacherPendingGradingCount,
  getTeacherSessionsToday,
  getTodaySchedule,
} from "@/actions/dashboard";
import { DashboardClient } from "@/features/dashboard/DashboardClient";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  announcements,
  enrollments,
  roles,
  semesters,
  teacherClassSubjects,
  users,
} from "@/lib/db/schema";

export default async function DashboardPage() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) redirect("/unauthorized");

  const roleLevel = ctx.roleLevel;
  const userId = session.userId;

  let stats: {
    totalStudents?: number;
    totalTeachers?: number;
    activeEnrollments?: number;
    pendingAnnouncements?: number;
    assignedClasses?: number;
    assignedSubjects?: number;
    ownEnrollmentStatus?: string;
  } = {};

  let registrationStats: Awaited<
    ReturnType<typeof getRegistrationStatsByMonth>
  > = [];
  let gpaHistory: Awaited<ReturnType<typeof getStudentGpaHistory>> = [];
  let todaySchedule: Awaited<ReturnType<typeof getTodaySchedule>> = [];
  let teacherClassAverages: Awaited<
    ReturnType<typeof getTeacherClassAverages>
  > = [];
  let recentActivities: Awaited<ReturnType<typeof getRecentActivities>> = [];

  let currentGpa = 0;
  let subjectCount = 0;
  let sppStatus: "paid" | "unpaid" | "unknown" = "unknown";
  let sessionsToday = 0;
  let pendingGrading = 0;

  if (roleLevel >= 80) {
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
          eq(enrollments.status, "active" as const),
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

    registrationStats = await getRegistrationStatsByMonth(6);
    recentActivities = await getRecentActivities(8);
  } else if (roleLevel === 60) {
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
            eq(teacherClassSubjects.teacherId, userId),
            eq(teacherClassSubjects.semesterId, semesterId),
            isNull(teacherClassSubjects.deletedAt)
          )
        );
      const subjectRows = await db
        .select({ count: sql<number>`count(distinct subject_id)` })
        .from(teacherClassSubjects)
        .where(
          and(
            eq(teacherClassSubjects.teacherId, userId),
            eq(teacherClassSubjects.semesterId, semesterId),
            isNull(teacherClassSubjects.deletedAt)
          )
        );

      stats = {
        assignedClasses: Number(classRows[0]?.count ?? 0),
        assignedSubjects: Number(subjectRows[0]?.count ?? 0),
      };
    }

    teacherClassAverages = await getTeacherClassAverages(userId);
    sessionsToday = await getTeacherSessionsToday(userId);
    pendingGrading = await getTeacherPendingGradingCount(userId);
    recentActivities = await getRecentActivities(5);
  } else if (roleLevel === 40) {
    const [enrollmentRow] = await db
      .select({ status: enrollments.status })
      .from(enrollments)
      .where(
        and(eq(enrollments.studentId, userId), isNull(enrollments.deletedAt))
      )
      .limit(1);

    if (enrollmentRow) {
      stats = { ownEnrollmentStatus: enrollmentRow.status ?? "unknown" };
    }

    gpaHistory = await getStudentGpaHistory(userId);
    currentGpa = await getStudentCurrentGpa(userId);
    subjectCount = await getStudentSubjectCount(userId);
    sppStatus = await getStudentSppStatus(userId);
    todaySchedule = await getTodaySchedule(userId);
  }

  const recentAnnouncements = await getRecentAnnouncements(5);

  return (
    <DashboardClient
      name={session.name}
      roleLevel={ctx?.roleLevel ?? 0}
      stats={stats}
      registrationStats={registrationStats}
      gpaHistory={gpaHistory}
      todaySchedule={todaySchedule}
      teacherClassAverages={teacherClassAverages}
      recentActivities={recentActivities}
      recentAnnouncements={recentAnnouncements}
      currentGpa={currentGpa}
      subjectCount={subjectCount}
      sppStatus={sppStatus}
      sessionsToday={sessionsToday}
      pendingGrading={pendingGrading}
    />
  );
}
