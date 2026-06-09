"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifyRoleLevel, verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { classes, enrollments, grades, subjects, users } from "@/lib/db/schema";

type GradeType = "knowledge" | "skill" | "attitude" | "extracurricular";

const VALID_TYPES: GradeType[] = [
  "knowledge",
  "skill",
  "attitude",
  "extracurricular",
];

function isValidGradeType(s: string): s is GradeType {
  return VALID_TYPES.includes(s as GradeType);
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
      enrollmentId: grades.enrollmentId,
      subjectId: grades.subjectId,
      type: grades.type,
      dailyTest1: grades.dailyTest1,
      dailyTest2: grades.dailyTest2,
      dailyTest3: grades.dailyTest3,
      dailyTest4: grades.dailyTest4,
      midterm: grades.midterm,
      finalExam: grades.finalExam,
      practical: grades.practical,
      project: grades.project,
      portfolio: grades.portfolio,
      score: grades.score,
      grade: grades.grade,
      predicate: grades.predicate,
      description: grades.description,
      studentId: enrollments.studentId,
      studentName: users.name,
    })
    .from(grades)
    .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.semesterId, semesterId),
        eq(grades.subjectId, subjectId),
        typeFilter ? eq(grades.type, typeFilter as GradeType) : undefined,
        isNull(grades.deletedAt),
        isNull(enrollments.deletedAt)
      )
    )
    .orderBy(users.name);

  return rows;
}

export async function getStudentGrades(studentId: string, semesterId?: number) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  // Permission: own grades OR grades.read_any
  if (
    !ctx ||
    (!ctx.permissions.has("grades.read_any") && session.userId !== studentId)
  ) {
    return [];
  }

  const conditions = [
    eq(enrollments.studentId, studentId),
    isNull(grades.deletedAt),
    isNull(enrollments.deletedAt),
  ];

  if (semesterId) {
    conditions.push(eq(enrollments.semesterId, semesterId));
  }

  return db
    .select({
      id: grades.id,
      enrollmentId: grades.enrollmentId,
      subjectId: grades.subjectId,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      subjectCredits: subjects.credits,
      type: grades.type,
      score: grades.score,
      grade: grades.grade,
      predicate: grades.predicate,
      semesterId: enrollments.semesterId,
      className: classes.name,
    })
    .from(grades)
    .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
    .innerJoin(subjects, eq(grades.subjectId, subjects.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .where(and(...conditions))
    .orderBy(subjects.name);
}

// ─── Mutations ────────────────────────────────────────────────

export async function upsertGrade(formData: FormData) {
  await verifyRoleLevel(60);

  const enrollmentId = formData.get("enrollmentId") as string;
  const subjectId = formData.get("subjectId") as string;
  const type = formData.get("type") as string;
  const score = formData.get("score") as string;
  const grade = formData.get("grade") as string;
  const predicate = formData.get("predicate") as string;
  const description = formData.get("description") as string;

  if (!enrollmentId || !subjectId || !type) {
    return { error: "enrollmentId, subjectId, dan type wajib diisi." };
  }

  if (!isValidGradeType(type)) {
    return { error: "Tipe nilai tidak valid." };
  }

  const values: Record<string, number | string | null> = {
    enrollmentId: Number(enrollmentId),
    subjectId: Number(subjectId),
    type: type as GradeType,
  };

  if (score?.trim()) values.score = score;
  if (grade?.trim()) values.grade = grade.toUpperCase();
  if (predicate?.trim()) values.predicate = predicate;
  if (description?.trim()) values.description = description;

  // Sub-score fields
  const subScoreFields = [
    "dailyTest1",
    "dailyTest2",
    "dailyTest3",
    "dailyTest4",
    "midterm",
    "finalExam",
    "practical",
    "project",
    "portfolio",
  ] as const;

  for (const field of subScoreFields) {
    const val = formData.get(field) as string;
    if (val?.trim()) {
      (values as any)[field] = val;
    }
  }

  await db
    .insert(grades)
    .values(values as any)
    .onDuplicateKeyUpdate({
      set: values as any,
    });

  revalidatePath("/academic/grades");
  return { success: true };
}

export async function bulkUpsertGrades(formData: FormData) {
  await verifyRoleLevel(60);

  // Parse JSON of grade rows from form data
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

  // Validate all rows
  for (const row of rows) {
    if (!row.enrollmentId || !row.subjectId || !row.type) {
      return {
        error: "Semua baris harus memiliki enrollmentId, subjectId, dan type.",
      };
    }
    if (!isValidGradeType(row.type)) {
      return { error: `Tipe nilai "${row.type}" tidak valid.` };
    }
  }

  // Prepare values for bulk insert
  const values = rows.map((row) => {
    const v: Record<string, any> = {
      enrollmentId: Number(row.enrollmentId),
      subjectId: Number(row.subjectId),
      type: row.type as GradeType,
    };
    if (row.score?.trim()) v.score = row.score;
    if (row.grade?.trim()) v.grade = row.grade.toUpperCase();
    if (row.predicate?.trim()) v.predicate = row.predicate;
    if (row.description?.trim()) v.description = row.description;

    const subScoreFields = [
      "dailyTest1",
      "dailyTest2",
      "dailyTest3",
      "dailyTest4",
      "midterm",
      "finalExam",
      "practical",
      "project",
      "portfolio",
    ];
    for (const field of subScoreFields) {
      if (row[field]?.trim()) v[field] = row[field];
    }
    return v;
  });

  try {
    await db
      .insert(grades)
      .values(values as any)
      .onDuplicateKeyUpdate({
        set: {
          score: sql`VALUES(score)`,
          grade: sql`VALUES(grade)`,
          predicate: sql`VALUES(predicate)`,
          description: sql`VALUES(description)`,
          dailyTest1: sql`VALUES(daily_test_1)`,
          dailyTest2: sql`VALUES(daily_test_2)`,
          dailyTest3: sql`VALUES(daily_test_3)`,
          dailyTest4: sql`VALUES(daily_test_4)`,
          midterm: sql`VALUES(midterm)`,
          finalExam: sql`VALUES(final_exam)`,
          practical: sql`VALUES(practical)`,
          project: sql`VALUES(project)`,
          portfolio: sql`VALUES(portfolio)`,
        },
      });

    revalidatePath("/academic/grades");
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

  revalidatePath("/academic/grades");
  return { success: true };
}
