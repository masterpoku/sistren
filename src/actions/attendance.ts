"use server";

import { and, asc, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  attendance,
  classes,
  enrollments,
  majors,
  subjects,
  teacherClassSubjects,
  users,
} from "@/lib/db/schema";
import {
  getAttendanceQuerySchema,
  markAttendanceSchema,
} from "@/lib/validation/schemas/attendance";

type AttendanceStatus = "present" | "sick" | "permit" | "absent" | "late";

function todayDDMMYY(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}${pad(d.getMonth() + 1)}${String(d.getFullYear()).slice(2)}`;
}

function startOfToday(): Date {
  // Anchor to UTC midnight so a WIB-day maps to a single UTC calendar date
  // (avoids the local-midnight shift that stored yesterday in MariaDB).
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toUTCDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

// ─── Public (no auth) helpers ──────────────────────────

export async function getActiveClasses() {
  const rows = await db
    .select({
      id: classes.id,
      name: classes.name,
      code: classes.code,
      majorName: majors.name,
      studentCount: sql<number>`count(distinct ${enrollments.studentId})`,
    })
    .from(classes)
    .leftJoin(majors, eq(classes.majorId, majors.id))
    .leftJoin(
      enrollments,
      and(
        eq(enrollments.classId, classes.id),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .where(isNull(classes.deletedAt))
    .groupBy(classes.id)
    .orderBy(asc(classes.code));

  return rows;
}

export async function getAttendanceSubjects(classId: number) {
  const [kls] = await db
    .select({ majorId: classes.majorId })
    .from(classes)
    .where(and(eq(classes.id, classId), isNull(classes.deletedAt)))
    .limit(1);

  const rows = await db
    .select({ id: subjects.id, name: subjects.name, code: subjects.code })
    .from(subjects)
    .where(
      and(
        eq(subjects.classId, classId),
        kls?.majorId
          ? or(eq(subjects.majorId, kls.majorId), isNull(subjects.majorId))
          : isNull(subjects.majorId),
        isNull(subjects.deletedAt)
      )
    )
    .orderBy(asc(subjects.name));

  return rows;
}

export async function getPublicRoster(classId: number) {
  const rows = await db
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

  return rows;
}

export async function getTeacherSubjects(classId: number) {
  const session = await verifySession();
  const rows = await db
    .select({ id: subjects.id, name: subjects.name, code: subjects.code })
    .from(teacherClassSubjects)
    .innerJoin(subjects, eq(teacherClassSubjects.subjectId, subjects.id))
    .where(
      and(
        eq(teacherClassSubjects.classId, classId),
        eq(teacherClassSubjects.teacherId, session.userId),
        isNull(teacherClassSubjects.deletedAt),
        isNull(subjects.deletedAt)
      )
    )
    .orderBy(asc(subjects.name));

  return rows;
}

export async function getClassSubjectAttendance(input: {
  classId: number;
  subjectId: number;
  sessionDate: string;
}) {
  const parsed = getAttendanceQuerySchema
    .extend({
      classId: z.coerce.number().int().positive(),
      subjectId: z.coerce.number().int().positive(),
    })
    .safeParse({ ...input, startDate: input.sessionDate, endDate: input.sessionDate });
  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  const sessionDate = toUTCDate(parsed.data.startDate);
  if (Number.isNaN(sessionDate.getTime())) {
    return { error: "Tanggal tidak valid." };
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
        eq(enrollments.classId, parsed.data.classId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .orderBy(asc(users.name));

  const records = await db
    .select({
      enrollmentId: attendance.enrollmentId,
      status: attendance.status,
      notes: attendance.notes,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.classId, parsed.data.classId),
        eq(attendance.subjectId, parsed.data.subjectId),
        eq(attendance.sessionDate, sessionDate),
        isNull(attendance.deletedAt)
      )
    );

  const statusMap: Record<
    number,
    { status: string; notes: string | null }
  > = {};
  for (const r of records) {
    statusMap[r.enrollmentId] = { status: r.status, notes: r.notes };
  }

  return { roster, statusMap };
}

export async function verifyAttendancePassword(
  classId: number,
  password: string
) {
  const [kls] = await db
    .select({ code: classes.code })
    .from(classes)
    .where(and(eq(classes.id, classId), isNull(classes.deletedAt)))
    .limit(1);

  if (!kls) return { error: "Kelas tidak ditemukan." };

  const prefix = kls.code.split("-")[0] ?? "";
  const expected = `${prefix}${todayDDMMYY()}`;

  if (password !== expected) {
    return { error: "Password tidak valid." };
  }
  return { success: true };
}

export async function markPublicAttendance(input: {
  classId: number;
  subjectId: number;
  records: Array<{
    enrollmentId: number;
    status: AttendanceStatus;
    notes?: string;
  }>;
}) {
  const { classId, subjectId, records } = input;

  const sessionDate = startOfToday();

  for (const record of records) {
    await db
      .insert(attendance)
      .values({
        classId,
        enrollmentId: record.enrollmentId,
        subjectId,
        sessionDate,
        status: record.status,
        notes: record.notes ?? null,
        recordedById: null,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: record.status,
          notes: record.notes ?? null,
        },
      });
  }

  revalidatePath("/academic/attendance");
  return { success: true };
}

// ─── Authenticated (teacher/admin) ─────────────────────

export async function markAttendance(input: {
  classId: number;
  subjectId: number;
  sessionDate: string;
  records: Array<{
    enrollmentId: number;
    status: AttendanceStatus;
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
        classId: parsed.data.classId,
        enrollmentId: record.enrollmentId,
        subjectId: parsed.data.subjectId,
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

  const startDate = toUTCDate(parsed.data.startDate);
  const endDate = toUTCDate(parsed.data.endDate);

  const records = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.classId, classId),
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
      subjectId: number;
      notes: string | null;
    }>
  >();
  for (const r of records) {
    const list = map.get(r.enrollmentId) ?? [];
    list.push({
      sessionDate: r.sessionDate,
      status: r.status,
      subjectId: r.subjectId,
      notes: r.notes,
    });
    map.set(r.enrollmentId, list);
  }

  return { roster, map: Array.from(map.entries()) };
}

export async function getStudentAttendance(input: {
  studentId: string;
  startDate: string;
  endDate: string;
  subjectId?: number;
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

  const startDate = toUTCDate(parsed.data.startDate);
  const endDate = toUTCDate(parsed.data.endDate);

  const filters: any[] = [
    eq(enrollments.studentId, studentId),
    gte(attendance.sessionDate, startDate),
    lte(attendance.sessionDate, endDate),
    isNull(attendance.deletedAt),
  ];
  if (input.subjectId) {
    filters.push(eq(attendance.subjectId, input.subjectId));
  }

  const rows = await db
    .select({
      sessionDate: attendance.sessionDate,
      status: attendance.status,
      subjectId: attendance.subjectId,
      notes: attendance.notes,
      subjectName: subjects.name,
    })
    .from(attendance)
    .innerJoin(enrollments, eq(attendance.enrollmentId, enrollments.id))
    .innerJoin(subjects, eq(attendance.subjectId, subjects.id))
    .where(and(...filters))
    .orderBy(desc(attendance.sessionDate));

  return { items: rows };
}

export async function getStudentSubjects(studentId: string) {
  const [enr] = await db
    .select({ classId: enrollments.classId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!enr) return [];

  const [kls] = await db
    .select({ majorId: classes.majorId })
    .from(classes)
    .where(and(eq(classes.id, enr.classId), isNull(classes.deletedAt)))
    .limit(1);

  const rows = await db
    .select({ id: subjects.id, name: subjects.name, code: subjects.code })
    .from(subjects)
    .where(
      and(
        eq(subjects.classId, enr.classId),
        kls?.majorId
          ? or(eq(subjects.majorId, kls.majorId), isNull(subjects.majorId))
          : isNull(subjects.majorId),
        isNull(subjects.deletedAt)
      )
    )
    .orderBy(asc(subjects.name));

  return rows;
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

  const startDate = toUTCDate(parsed.data.startDate);
  const endDate = toUTCDate(parsed.data.endDate);
  const classId = parsed.data.classId;
  if (!classId) {
    return { error: "classId wajib diisi." };
  }

  const totals = await db
    .select({
      status: attendance.status,
      subjectId: attendance.subjectId,
      count: sql<number>`count(*)`,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.classId, classId),
        gte(attendance.sessionDate, startDate),
        lte(attendance.sessionDate, endDate),
        isNull(attendance.deletedAt)
      )
    )
    .groupBy(attendance.status, attendance.subjectId);

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

  const records = await db
    .select({
      enrollmentId: attendance.enrollmentId,
      sessionDate: attendance.sessionDate,
      status: attendance.status,
      subjectId: attendance.subjectId,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.classId, classId),
        gte(attendance.sessionDate, startDate),
        lte(attendance.sessionDate, endDate),
        isNull(attendance.deletedAt)
      )
    );

  const subjects = await getAttendanceSubjects(classId);

  return { totals, roster, records, subjects };
}

export async function getAttendanceYearlySummary(input: {
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

  const startDate = toUTCDate(parsed.data.startDate);
  const endDate = toUTCDate(parsed.data.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: "Tanggal tidak valid." };
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
        eq(enrollments.classId, input.classId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .orderBy(asc(users.name));

  // Per-student status counts
  const perStudent = await db
    .select({
      enrollmentId: attendance.enrollmentId,
      status: attendance.status,
      count: sql<number>`count(*)`,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.classId, input.classId),
        gte(attendance.sessionDate, startDate),
        lte(attendance.sessionDate, endDate),
        isNull(attendance.deletedAt)
      )
    )
    .groupBy(attendance.enrollmentId, attendance.status);

  // Per-student per-month status counts
  const perStudentMonth = await db
    .select({
      enrollmentId: attendance.enrollmentId,
      month: sql<number>`month(${attendance.sessionDate})`,
      status: attendance.status,
      count: sql<number>`count(*)`,
    })
    .from(attendance)
    .where(
      and(
        eq(attendance.classId, input.classId),
        gte(attendance.sessionDate, startDate),
        lte(attendance.sessionDate, endDate),
        isNull(attendance.deletedAt)
      )
    )
    .groupBy(
      attendance.enrollmentId,
      sql`month(${attendance.sessionDate})`,
      attendance.status
    );

  return { roster, perStudent, perStudentMonth };
}
