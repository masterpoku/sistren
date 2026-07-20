"use server";

import { and, eq, isNull, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  classes,
  enrollments,
  grades,
  semesters,
  subjects,
  teacherClassSubjects,
  users,
} from "@/lib/db/schema";
import { gradeTypeSchema } from "@/lib/validation/schemas/grades";

type GradeType = "knowledge" | "skill" | "attitude" | "extracurricular";

function isValidGradeType(s: string): s is GradeType {
  return gradeTypeSchema.safeParse(s).success;
}

// ─── Query ───────────────────────────────────────────────────

export async function getGrades(
  classId: number,
  subjectId: number,
  semesterId: number,
  type?: string
) {
  await verifyRoleLevel(60);

  const typeFilter = type && isValidGradeType(type) ? type : undefined;

  const rows = await db
    .select({
      id: grades.id,
      studentId: grades.studentId,
      subjectId: grades.subjectId,
      type: grades.type,
      dailyTest1: grades.dailyTest1,
      dailyTest2: grades.dailyTest2,
      dailyTest3: grades.dailyTest3,
      dailyTest4: grades.dailyTest4,
      dailyTest5: grades.dailyTest5,
      dailyTest6: grades.dailyTest6,
      dailyTest7: grades.dailyTest7,
      dailyTest8: grades.dailyTest8,
      dailyTest9: grades.dailyTest9,
      dailyTest10: grades.dailyTest10,
      midterm: grades.midterm,
      finalExam: grades.finalExam,
      score: grades.score,
      studentName: users.name,
    })
    .from(grades)
    .innerJoin(users, eq(grades.studentId, users.id))
    .where(
      and(
        eq(grades.classId, classId),
        eq(grades.semesterId, semesterId),
        eq(grades.subjectId, subjectId),
        typeFilter ? eq(grades.type, typeFilter as GradeType) : undefined,
        isNull(grades.deletedAt),
        isNull(users.deletedAt)
      )
    )
    .orderBy(users.name);

  return rows;
}

export async function getStudentGrades(studentId: string, semesterId?: number) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (
    !ctx ||
    (!ctx.permissions.has("grades.read_any") && session.userId !== studentId)
  ) {
    return [];
  }

  const conditions = [
    eq(grades.studentId, studentId),
    isNull(grades.deletedAt),
  ];

  if (semesterId) {
    conditions.push(eq(grades.semesterId, semesterId));
  }

  return db
    .select({
      id: grades.id,
      studentId: grades.studentId,
      classId: grades.classId,
      semesterId: grades.semesterId,
      subjectId: grades.subjectId,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      subjectCredits: subjects.credits,
      type: grades.type,
      dailyTest1: grades.dailyTest1,
      dailyTest2: grades.dailyTest2,
      dailyTest3: grades.dailyTest3,
      dailyTest4: grades.dailyTest4,
      dailyTest5: grades.dailyTest5,
      dailyTest6: grades.dailyTest6,
      dailyTest7: grades.dailyTest7,
      dailyTest8: grades.dailyTest8,
      dailyTest9: grades.dailyTest9,
      dailyTest10: grades.dailyTest10,
      midterm: grades.midterm,
      finalExam: grades.finalExam,
      score: grades.score,
      semesterName: semesters.name,
      semesterYear: semesters.academicYear,
      classCode: classes.code,
    })
    .from(grades)
    .innerJoin(subjects, eq(grades.subjectId, subjects.id))
    .innerJoin(classes, eq(grades.classId, classes.id))
    .innerJoin(semesters, eq(grades.semesterId, semesters.id))
    .where(and(...conditions))
    .orderBy(subjects.name);
}

// ─── Helpers ────────────────────────────────────────────────

async function canEditGrades(classId: number, userId: string): Promise<boolean> {
  const ctx = await getAuthContext(userId);
  if (!ctx) return false;
  if (ctx.roleLevel >= 100) return true;

  const [kls] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      and(
        eq(classes.id, classId),
        eq(classes.homeroomTeacherId, userId),
        isNull(classes.deletedAt)
      )
    )
    .limit(1);

  return !!kls;
}

function getSubScores(values: Record<string, any>): number[] {
  const fields = [
    "dailyTest1", "dailyTest2", "dailyTest3", "dailyTest4",
    "dailyTest5", "dailyTest6", "dailyTest7", "dailyTest8",
    "dailyTest9", "dailyTest10",
    "midterm", "finalExam",
  ];
  return fields
    .map((f) => {
      const v = values[f];
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    })
    .filter((n): n is number => n !== null);
}

function autoCalculateScore(values: Record<string, any>): string | null {
  const scores = getSubScores(values);
  if (scores.length === 0) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg.toFixed(2);
}

// ─── Mutations ────────────────────────────────────────────────

export async function upsertGrade(formData: FormData) {
  await verifyRoleLevel(60);

  const studentId = formData.get("studentId") as string;
  const classId = formData.get("classId") as string;
  const semesterId = formData.get("semesterId") as string;
  const subjectId = formData.get("subjectId") as string;
  const type = formData.get("type") as string;
  const teacherId = formData.get("teacherId") as string;

  if (!studentId || !classId || !semesterId || !subjectId || !type) {
    return { error: "studentId, classId, semesterId, subjectId, dan type wajib diisi." };
  }

  if (!isValidGradeType(type)) {
    return { error: "Tipe nilai tidak valid." };
  }

  const session = await verifySession();
  const classIdNum = Number(classId);

  if (!(await canEditGrades(classIdNum, session.userId))) {
    return { error: "Anda tidak memiliki izin untuk menginput nilai di kelas ini." };
  }

  const values: Record<string, any> = {
    studentId,
    classId: classIdNum,
    semesterId: Number(semesterId),
    subjectId: Number(subjectId),
    type: type as GradeType,
    teacherId: teacherId || session.userId,
  };

  const subScoreFields = [
    "dailyTest1", "dailyTest2", "dailyTest3", "dailyTest4",
    "dailyTest5", "dailyTest6", "dailyTest7", "dailyTest8",
    "dailyTest9", "dailyTest10",
    "midterm", "finalExam",
  ];

  for (const field of subScoreFields) {
    const val = formData.get(field) as string;
    if (val?.trim()) {
      values[field] = val;
    }
  }

  values.score = autoCalculateScore(values);

  await db
    .insert(grades)
    .values(values as any)
    .onDuplicateKeyUpdate({
      set: values as any,
    });

  revalidatePath("/academic");
  revalidatePath("/students");
  return { success: true };
}

export async function bulkUpsertGrades(formData: FormData) {
  await verifyRoleLevel(60);

  const rowsJson = formData.get("rows") as string;
  if (!rowsJson) {
    return { error: "Data nilai tidak ditemukan." };
  }

  let rows: Array<Record<string, any>>;
  try {
    rows = JSON.parse(rowsJson);
  } catch {
    return { error: "Format data nilai tidak valid." };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Tidak ada data nilai." };
  }

  const session = await verifySession();

  // Verify access: all rows must belong to classes user can edit
  const classIds = [...new Set(rows.map((r) => Number(r.classId)))];
  for (const cid of classIds) {
    if (!(await canEditGrades(cid, session.userId))) {
      return { error: "Anda tidak memiliki izin untuk menginput nilai di salah satu kelas." };
    }
  }

  for (const row of rows) {
    if (!row.studentId || !row.classId || !row.semesterId || !row.subjectId || !row.type) {
      return {
        error: "Semua baris harus memiliki studentId, classId, semesterId, subjectId, dan type.",
      };
    }
    if (!isValidGradeType(row.type)) {
      return { error: `Tipe nilai "${row.type}" tidak valid.` };
    }
  }

  const values = rows.map((row) => {
    const v: Record<string, any> = {
      studentId: row.studentId,
      classId: Number(row.classId),
      semesterId: Number(row.semesterId),
      subjectId: Number(row.subjectId),
      type: row.type as GradeType,
      teacherId: session.userId,
    };

    const subScoreFields = [
      "dailyTest1", "dailyTest2", "dailyTest3", "dailyTest4",
      "dailyTest5", "dailyTest6", "dailyTest7", "dailyTest8",
      "dailyTest9", "dailyTest10",
      "midterm", "finalExam",
    ];
    for (const field of subScoreFields) {
      if (row[field]?.trim()) v[field] = row[field];
    }

    v.score = autoCalculateScore(v);
    return v;
  });

  try {
    await db
      .insert(grades)
      .values(values as any)
      .onDuplicateKeyUpdate({
        set: {
          score: sql`VALUES(score)`,
          dailyTest1: sql`VALUES(daily_test_1)`,
          dailyTest2: sql`VALUES(daily_test_2)`,
          dailyTest3: sql`VALUES(daily_test_3)`,
          dailyTest4: sql`VALUES(daily_test_4)`,
          dailyTest5: sql`VALUES(daily_test_5)`,
          dailyTest6: sql`VALUES(daily_test_6)`,
          dailyTest7: sql`VALUES(daily_test_7)`,
          dailyTest8: sql`VALUES(daily_test_8)`,
          dailyTest9: sql`VALUES(daily_test_9)`,
          dailyTest10: sql`VALUES(daily_test_10)`,
          midterm: sql`VALUES(midterm)`,
          finalExam: sql`VALUES(final_exam)`,
        },
      });

    revalidatePath("/academic");
    revalidatePath("/students");
    return { success: true, count: values.length };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Gagal menyimpan nilai";
    return { error: message };
  }
}

export async function deleteGrade(gradeId: string) {
  await verifyRoleLevel(60);

  const [existing] = await db
    .select({ id: grades.id })
    .from(grades)
    .where(and(eq(grades.id, Number(gradeId)), isNull(grades.deletedAt)))
    .limit(1);

  if (!existing) {
    return { error: "Nilai tidak ditemukan." };
  }

  await db
    .update(grades)
    .set({ deletedAt: new Date() })
    .where(eq(grades.id, Number(gradeId)));

  revalidatePath("/academic");
  return { success: true };
}

// ─── Grade Input Data ─────────────────────────────────────────

export async function getGradeInputSubjects(classId: number, semesterId: number) {
  let rows = await db
    .selectDistinct({
      id: subjects.id,
      name: subjects.name,
      code: subjects.code,
    })
    .from(teacherClassSubjects)
    .innerJoin(subjects, eq(teacherClassSubjects.subjectId, subjects.id))
    .where(
      and(
        eq(teacherClassSubjects.classId, classId),
        eq(teacherClassSubjects.semesterId, semesterId),
        isNull(teacherClassSubjects.deletedAt),
        isNull(subjects.deletedAt)
      )
    )
    .orderBy(subjects.name);

  if (rows.length === 0) {
    // Get the class majorId to filter subjects
    const [kls] = await db
      .select({ majorId: classes.majorId })
      .from(classes)
      .where(and(eq(classes.id, classId), isNull(classes.deletedAt)))
      .limit(1);

    rows = await db
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
      .orderBy(subjects.name);
  }

  return rows;
}

export async function getGradeInputTable(
  classId: number,
  subjectId: number,
  semesterId: number
) {
  const studentRows = await db
    .select({
      studentId: enrollments.studentId,
      studentName: users.name,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.semesterId, semesterId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt),
        isNull(users.deletedAt)
      )
    )
    .orderBy(users.name);

  const existingGrades = await db
    .select({
      studentId: grades.studentId,
      dailyTest1: grades.dailyTest1,
      dailyTest2: grades.dailyTest2,
      dailyTest3: grades.dailyTest3,
      dailyTest4: grades.dailyTest4,
      dailyTest5: grades.dailyTest5,
      dailyTest6: grades.dailyTest6,
      dailyTest7: grades.dailyTest7,
      dailyTest8: grades.dailyTest8,
      dailyTest9: grades.dailyTest9,
      dailyTest10: grades.dailyTest10,
      midterm: grades.midterm,
      finalExam: grades.finalExam,
      score: grades.score,
    })
    .from(grades)
    .where(
      and(
        eq(grades.classId, classId),
        eq(grades.subjectId, subjectId),
        eq(grades.semesterId, semesterId),
        eq(grades.type, "knowledge"),
        isNull(grades.deletedAt)
      )
    );

  const gradeMap = new Map<string, Record<string, any>>();
  for (const g of existingGrades) {
    gradeMap.set(g.studentId, g);
  }

  const rows = studentRows.map((s) => {
    const existing = gradeMap.get(s.studentId) ?? null;
    return {
      studentId: s.studentId,
      studentName: s.studentName,
      existing,
    };
  });

  return { rows };
}