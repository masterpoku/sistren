"use server";

import { and, asc, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  attendance,
  classes,
  enrollments,
  teacherClassSubjects,
  users,
} from "@/lib/db/schema";
import {
  getAttendanceQuerySchema,
  markAttendanceSchema,
} from "@/lib/validation/schemas/attendance";

export async function markAttendance(input: {
  classId: number;
  sessionDate: string;
  records: Array<{
    enrollmentId: number;
    status: "present" | "sick" | "permit" | "absent" | "late";
    notes?: string;
  }>;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 60) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = markAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const [ownClass] = await db
    .select({ id: classes.id })
    .from(classes)
    .innerJoin(
      teacherClassSubjects,
      and(
        eq(teacherClassSubjects.classId, classes.id),
        eq(teacherClassSubjects.teacherId, session.userId)
      )
    )
    .where(eq(classes.id, parsed.data.classId))
    .limit(1);

  if (!ownClass && ctx.roleLevel < 80) {
    return { error: "Anda bukan guru kelas ini." };
  }

  const sessionDate = new Date(parsed.data.sessionDate);
  if (Number.isNaN(sessionDate.getTime())) {
    return { error: "Tanggal tidak valid." };
  }

  for (const record of parsed.data.records) {
    await db
      .insert(attendance)
      .values({
        enrollmentId: record.enrollmentId,
        sessionDate,
        status: record.status,
        notes: record.notes ?? null,
        recordedById: session.userId,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: record.status,
          notes: record.notes ?? null,
          recordedById: session.userId,
        },
      });
  }

  revalidatePath("/academic/attendance");
  return { success: true };
}

export async function getAttendanceByClass(input: {
  classId: number;
  startDate: string;
  endDate: string;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = getAttendanceQuerySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const classId = parsed.data.classId;
  if (!classId) {
    return { error: "classId wajib diisi." };
  }

  const [ownClass] = await db
    .select({ id: classes.id })
    .from(classes)
    .innerJoin(
      teacherClassSubjects,
      and(
        eq(teacherClassSubjects.classId, classes.id),
        eq(teacherClassSubjects.teacherId, session.userId)
      )
    )
    .where(eq(classes.id, classId))
    .limit(1);

  if (!ownClass && ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin untuk kelas ini." };
  }

  const roster = await db
    .select({
      enrollmentId: enrollments.id,
      studentId: enrollments.studentId,
      studentName: users.name,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .orderBy(asc(users.name));

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);

  const records = await db
    .select()
    .from(attendance)
    .innerJoin(enrollments, eq(attendance.enrollmentId, enrollments.id))
    .where(
      and(
        eq(enrollments.classId, classId),
        gte(attendance.sessionDate, startDate),
        lte(attendance.sessionDate, endDate),
        isNull(attendance.deletedAt)
      )
    );

  const map = new Map<
    number,
    Array<{
      sessionDate: Date;
      status: string;
      notes: string | null;
    }>
  >();
  for (const r of records) {
    const list = map.get(r.attendance.enrollmentId) ?? [];
    list.push({
      sessionDate: r.attendance.sessionDate,
      status: r.attendance.status,
      notes: r.attendance.notes,
    });
    map.set(r.attendance.enrollmentId, list);
  }

  return { roster, map: Array.from(map.entries()) };
}

export async function getStudentAttendance(input: {
  studentId: string;
  startDate: string;
  endDate: string;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = getAttendanceQuerySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  if (parsed.data.studentId !== session.userId && ctx.roleLevel < 80) {
    return { error: "Anda hanya dapat melihat absensi sendiri." };
  }
  const studentId = parsed.data.studentId;
  if (!studentId) {
    return { error: "studentId wajib diisi." };
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);

  const rows = await db
    .select()
    .from(attendance)
    .innerJoin(enrollments, eq(attendance.enrollmentId, enrollments.id))
    .where(
      and(
        eq(enrollments.studentId, studentId),
        gte(attendance.sessionDate, startDate),
        lte(attendance.sessionDate, endDate),
        isNull(attendance.deletedAt)
      )
    )
    .orderBy(desc(attendance.sessionDate));

  return {
    items: rows.map((r) => ({
      sessionDate: r.attendance.sessionDate,
      status: r.attendance.status,
      notes: r.attendance.notes,
    })),
  };
}

export async function getAttendanceReport(input: {
  classId: number;
  startDate: string;
  endDate: string;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = getAttendanceQuerySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);
  const classId = parsed.data.classId;
  if (!classId) {
    return { error: "classId wajib diisi." };
  }

  const totals = await db
    .select({
      status: attendance.status,
      count: sql<number>`count(*)`,
    })
    .from(attendance)
    .innerJoin(enrollments, eq(attendance.enrollmentId, enrollments.id))
    .where(
      and(
        eq(enrollments.classId, classId),
        gte(attendance.sessionDate, startDate),
        lte(attendance.sessionDate, endDate),
        isNull(attendance.deletedAt)
      )
    )
    .groupBy(attendance.status);

  return { totals };
}
