"use server";

import { and, avg, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  announcements,
  auditLogs,
  calendarEvents,
  classes,
  enrollments,
  grades,
  semesters,
  subjects,
  users,
} from "@/lib/db/schema";

const MONTH_NAMES_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

export type RegistrationStat = { name: string; total: number };
export type GpaPoint = { semester: string; gpa: number };
export type TodayEvent = {
  id: number;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  category: string | null;
};
export type ActivityItem = {
  id: number;
  action: string;
  entityType: string | null;
  userName: string | null;
  createdAt: Date;
};

export async function getRegistrationStatsByMonth(
  monthsBack = 6
): Promise<RegistrationStat[]> {
  await verifySession();

  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth() - (monthsBack - 1),
    1
  );

  const rows = await db
    .select({
      y: sql<number>`YEAR(${enrollments.createdAt})`,
      m: sql<number>`MONTH(${enrollments.createdAt})`,
      total: sql<number>`COUNT(*)`,
    })
    .from(enrollments)
    .where(
      and(gte(enrollments.createdAt, start), isNull(enrollments.deletedAt))
    )
    .groupBy(
      sql`YEAR(${enrollments.createdAt})`,
      sql`MONTH(${enrollments.createdAt})`
    );

  const byKey = new Map<string, number>();
  for (const r of rows) {
    byKey.set(`${r.y}-${r.m}`, Number(r.total));
  }

  const result: RegistrationStat[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    result.push({
      name: MONTH_NAMES_ID[d.getMonth()],
      total: byKey.get(key) ?? 0,
    });
  }

  return result;
}

export async function getStudentGpaHistory(
  userId: string
): Promise<GpaPoint[]> {
  await verifySession();

  const rows = await db
    .select({
      semesterName: semesters.name,
      academicYear: semesters.academicYear,
      avgScore: avg(grades.score),
    })
    .from(grades)
    .innerJoin(semesters, eq(grades.semesterId, semesters.id))
    .where(
      and(eq(grades.studentId, userId), isNull(grades.deletedAt))
    )
    .groupBy(grades.semesterId, semesters.name, semesters.academicYear)
    .orderBy(semesters.academicYear);

  return rows.map((r) => ({
    semester: r.semesterName,
    gpa: r.avgScore ? Math.round(Number(r.avgScore) * 100) / 100 : 0,
  }));
}

export async function getStudentCurrentGpa(userId: string): Promise<number> {
  await verifySession();

  const [row] = await db
    .select({ avgScore: avg(grades.score) })
    .from(grades)
    .where(
      and(eq(grades.studentId, userId), isNull(grades.deletedAt))
    );

  if (!row?.avgScore) return 0;
  return Math.round(Number(row.avgScore) * 100) / 100;
}

export async function getStudentSubjectCount(userId: string): Promise<number> {
  await verifySession();

  const activeSemester = await db
    .select({ id: semesters.id })
    .from(semesters)
    .where(eq(semesters.isActive, true))
    .limit(1);

  if (activeSemester.length === 0) return 0;
  const semesterId = activeSemester[0].id;

  const [enrollment] = await db
    .select({ classId: enrollments.classId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, userId),
        eq(enrollments.semesterId, semesterId),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!enrollment) return 0;

  const [row] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(subjects)
    .where(
      and(eq(subjects.classId, enrollment.classId), isNull(subjects.deletedAt))
    );

  return Number(row?.count ?? 0);
}

export type StudentSppStatus = "paid" | "unpaid" | "unknown";

export async function getStudentSppStatus(
  userId: string
): Promise<StudentSppStatus> {
  await verifySession();

  // Heuristic: any payment with status 'paid' in current month = lunas
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const rows = await db.execute(sql`
    SELECT status FROM payments
    WHERE student_id = ${userId}
      AND deleted_at IS NULL
      AND created_at BETWEEN ${startOfMonth} AND ${endOfMonth}
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const first = (rows as unknown as Array<{ status: string }>)[0];
  if (!first) return "unknown";
  return first.status === "paid" ? "paid" : "unpaid";
}

export async function getTodaySchedule(userId: string): Promise<TodayEvent[]> {
  await verifySession();

  const ctx = await getAuthContext(userId);
  if (!ctx) return [];

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startAt: calendarEvents.startAt,
      endAt: calendarEvents.endAt,
      category: calendarEvents.category,
    })
    .from(calendarEvents)
    .where(
      and(
        isNull(calendarEvents.deletedAt),
        eq(calendarEvents.isPublic, true),
        gte(calendarEvents.startAt, start),
        lte(calendarEvents.startAt, end)
      )
    )
    .orderBy(calendarEvents.startAt)
    .limit(10);

  return rows;
}

export async function getTeacherSessionsToday(
  _teacherId: string
): Promise<number> {
  await verifySession();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [row] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${calendarEvents.id})` })
    .from(calendarEvents)
    .where(
      and(
        isNull(calendarEvents.deletedAt),
        gte(calendarEvents.startAt, start),
        lte(calendarEvents.startAt, end)
      )
    );

  return Number(row?.count ?? 0);
}

export async function getTeacherPendingGradingCount(
  teacherId: string
): Promise<number> {
  await verifySession();

  const [row] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(grades)
    .where(
      and(
        eq(grades.teacherId, teacherId),
        isNull(grades.score),
        isNull(grades.deletedAt)
      )
    );

  return Number(row?.count ?? 0);
}

export async function getTeacherClassAverages(
  teacherId: string
): Promise<GpaPoint[]> {
  await verifySession();

  const rows = await db
    .select({
      className: classes.name,
      avgScore: avg(grades.score),
    })
    .from(grades)
    .innerJoin(classes, eq(grades.classId, classes.id))
    .where(and(eq(grades.teacherId, teacherId), isNull(grades.deletedAt)))
    .groupBy(classes.id, classes.name)
    .orderBy(classes.name);

  return rows.map((r) => ({
    semester: r.className,
    gpa: r.avgScore ? Math.round(Number(r.avgScore) * 100) / 100 : 0,
  }));
}

export async function getRecentActivities(limit = 8): Promise<ActivityItem[]> {
  await verifySession();

  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      userId: auditLogs.userId,
      userName: users.name,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    entityType: r.entityType,
    userName: r.userName,
    createdAt: r.createdAt,
  }));
}

export async function getRecentAnnouncements(limit = 5) {
  await verifySession();

  return db
    .select({
      id: announcements.id,
      title: announcements.title,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .where(isNull(announcements.deletedAt))
    .orderBy(desc(announcements.createdAt))
    .limit(limit);
}
