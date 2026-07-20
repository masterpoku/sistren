"use server";

import { and, eq, isNull, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext, hasPermission } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { auditLogs, classes, enrollments, grades, roles, semesters, subjects, users } from "@/lib/db/schema";
import {
  bulkTransferStudentsSchema,
  graduateStudentSchema,
  promoteClassSchema,
  transferStudentSchema,
} from "@/lib/validation/schemas/promotion";

async function writeAudit(
  userId: string,
  action: string,
  entityType: string,
  entityIdStr: string,
  metadata: Record<string, unknown>
) {
  await db.insert(auditLogs).values({
    userId,
    action,
    entityType,
    entityIdStr,
    metadata,
  });
}

export async function transferStudent(input: {
  studentId: string;
  sourceSemesterId: number;
  targetClassId: number;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx?.permissions.has("students.update")) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = transferStudentSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue ? issue.message : "Data tidak valid." };
  }

  const [targetClass] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      and(eq(classes.id, parsed.data.targetClassId), isNull(classes.deletedAt))
    )
    .limit(1);
  if (!targetClass) {
    return { error: "Kelas tujuan tidak ditemukan." };
  }

  const [enrollment] = await db
    .select({ id: enrollments.id, classId: enrollments.classId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, parsed.data.studentId),
        eq(enrollments.semesterId, parsed.data.sourceSemesterId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!enrollment) {
    return { error: "Pendaftaran siswa tidak ditemukan." };
  }

  await db
    .update(enrollments)
    .set({ classId: parsed.data.targetClassId })
    .where(eq(enrollments.id, enrollment.id));

  await writeAudit(
    session.userId,
    "student.transfer",
    "enrollment",
    String(enrollment.id),
    {
      studentId: parsed.data.studentId,
      fromClassId: enrollment.classId,
      toClassId: parsed.data.targetClassId,
      semesterId: parsed.data.sourceSemesterId,
    }
  );

  revalidatePath("/students");
  revalidatePath(`/students/${parsed.data.studentId}`);
  revalidatePath("/students/manage-class");
  return { success: true };
}

export async function bulkTransferStudents(input: {
  studentIds: string[];
  sourceSemesterId: number;
  targetClassId: number;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx?.permissions.has("students.update")) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = bulkTransferStudentsSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue ? issue.message : "Data tidak valid." };
  }

  const [targetClass] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      and(eq(classes.id, parsed.data.targetClassId), isNull(classes.deletedAt))
    )
    .limit(1);
  if (!targetClass) {
    return { error: "Kelas tujuan tidak ditemukan." };
  }

  let updated = 0;
  for (const studentId of parsed.data.studentIds) {
    const [enrollment] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.semesterId, parsed.data.sourceSemesterId),
          eq(enrollments.status, "active"),
          isNull(enrollments.deletedAt)
        )
      )
      .limit(1);
    if (!enrollment) continue;

    await db
      .update(enrollments)
      .set({ classId: parsed.data.targetClassId })
      .where(eq(enrollments.id, enrollment.id));

    await writeAudit(
      session.userId,
      "student.bulk_transfer",
      "enrollment",
      String(enrollment.id),
      {
        studentId,
        toClassId: parsed.data.targetClassId,
        semesterId: parsed.data.sourceSemesterId,
      }
    );

    updated += 1;
  }

  revalidatePath("/students");
  revalidatePath("/students/manage-class");
  return { success: true, updated };
}

export async function promoteClass(input: {
  sourceClassId: number;
  sourceSemesterId: number;
  targetSemesterId: number;
  targetClassId: number;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx?.permissions.has("students.update")) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = promoteClassSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue ? issue.message : "Data tidak valid." };
  }

  if (parsed.data.sourceSemesterId === parsed.data.targetSemesterId) {
    return { error: "Semester asal dan tujuan harus berbeda." };
  }

  const sourceEnrollments = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
    })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, parsed.data.sourceClassId),
        eq(enrollments.semesterId, parsed.data.sourceSemesterId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    );

  if (sourceEnrollments.length === 0) {
    return { error: "Tidak ada siswa aktif di kelas asal." };
  }

  let promoted = 0;
  let skipped = 0;

  for (const enrollment of sourceEnrollments) {
    const [existingTarget] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, enrollment.studentId),
          eq(enrollments.semesterId, parsed.data.targetSemesterId),
          isNull(enrollments.deletedAt)
        )
      )
      .limit(1);

    if (existingTarget) {
      skipped += 1;
      continue;
    }

    await db.insert(enrollments).values({
      studentId: enrollment.studentId,
      semesterId: parsed.data.targetSemesterId,
      classId: parsed.data.targetClassId,
      status: "active",
    });

    promoted += 1;
  }

  await db
    .update(enrollments)
    .set({ status: "transferred" })
    .where(
      and(
        eq(enrollments.classId, parsed.data.sourceClassId),
        eq(enrollments.semesterId, parsed.data.sourceSemesterId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    );

  await writeAudit(
    session.userId,
    "class.promote",
    "class",
    String(parsed.data.sourceClassId),
    {
      sourceClassId: parsed.data.sourceClassId,
      sourceSemesterId: parsed.data.sourceSemesterId,
      targetSemesterId: parsed.data.targetSemesterId,
      targetClassId: parsed.data.targetClassId,
      promoted,
      skipped,
    }
  );

  revalidatePath("/students");
  revalidatePath("/students/manage-class");
  return { success: true, promoted, skipped };
}

export async function graduateStudent(input: {
  studentId: string;
  semesterId: number;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx?.permissions.has("students.update")) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = graduateStudentSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue ? issue.message : "Data tidak valid." };
  }

  const [enrollment] = await db
    .select({ id: enrollments.id, status: enrollments.status })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, parsed.data.studentId),
        eq(enrollments.semesterId, parsed.data.semesterId),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!enrollment) {
    return { error: "Pendaftaran tidak ditemukan." };
  }
  if (enrollment.status === "graduated") {
    return { error: "Siswa sudah lulus." };
  }

  const [alumniRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.name, "alumni"), isNull(roles.deletedAt)))
    .limit(1);

  await db.transaction(async (tx) => {
    await tx
      .update(enrollments)
      .set({ status: "graduated" })
      .where(
        and(
          eq(enrollments.studentId, parsed.data.studentId),
          eq(enrollments.status, "active"),
          isNull(enrollments.deletedAt)
        )
      );

    if (alumniRole) {
      await tx
        .update(users)
        .set({ roleId: alumniRole.id })
        .where(eq(users.id, parsed.data.studentId));
    }
  });

  await writeAudit(
    session.userId,
    "student.graduate",
    "enrollment",
    String(parsed.data.studentId),
    {
      studentId: parsed.data.studentId,
      semesterId: parsed.data.semesterId,
    }
  );

  revalidatePath("/students");
  revalidatePath(`/students/${parsed.data.studentId}`);
  revalidatePath("/students/manage-class");
  return { success: true };
}

export async function getPromotionPreview(input: {
  sourceClassId: number;
  sourceSemesterId: number;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx) {
    return { error: "Anda tidak memiliki izin." };
  }

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, input.sourceClassId),
        eq(enrollments.semesterId, input.sourceSemesterId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    );

  return { count: Number(rows[0]?.count ?? 0) };
}

export async function getGraduationData(studentId: string, semesterId: number) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [enrollment] = await db
    .select({
      id: enrollments.id,
      classId: enrollments.classId,
      className: classes.name,
      classCode: classes.code,
      semesterName: semesters.name,
      academicYear: semesters.academicYear,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(semesters, eq(enrollments.semesterId, semesters.id))
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.semesterId, semesterId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!enrollment) {
    return { error: "Enrollment tidak ditemukan." };
  }

  const [student] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(and(eq(users.id, studentId), isNull(users.deletedAt)))
    .limit(1);

  if (!student) {
    return { error: "Siswa tidak ditemukan." };
  }

  const [classRow] = await db
    .select({ majorId: classes.majorId })
    .from(classes)
    .where(and(eq(classes.id, enrollment.classId), isNull(classes.deletedAt)))
    .limit(1);

  const subjectList = await db
    .select({ id: subjects.id, name: subjects.name, code: subjects.code })
    .from(subjects)
    .where(
      and(
        eq(subjects.classId, enrollment.classId),
        classRow?.majorId
          ? or(eq(subjects.majorId, classRow.majorId), isNull(subjects.majorId))
          : isNull(subjects.majorId),
        isNull(subjects.deletedAt)
      )
    )
    .orderBy(subjects.name);

  // Fetch existing grades for this student + class + semester
  const existingGrades = await db
    .select({
      subjectId: grades.subjectId,
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
        eq(grades.studentId, studentId),
        eq(grades.classId, enrollment.classId),
        eq(grades.semesterId, semesterId),
        eq(grades.type, "knowledge"),
        isNull(grades.deletedAt)
      )
    );

  const gradeMap: Record<number, typeof existingGrades[0]> = {};
  for (const g of existingGrades) {
    gradeMap[g.subjectId] = g;
  }

  const subjectsWithGrades = subjectList.map((s) => ({
    ...s,
    grades: gradeMap[s.id] ?? null,
  }));

  // Fetch all classes and semesters for Naik Kelas picker
  const allClasses = await db
    .select({ id: classes.id, name: classes.name, code: classes.code })
    .from(classes)
    .where(isNull(classes.deletedAt))
    .orderBy(classes.name);

  const allSemesters = await db
    .select({ id: semesters.id, name: semesters.name, academicYear: semesters.academicYear, isActive: semesters.isActive })
    .from(semesters)
    .where(isNull(semesters.deletedAt))
    .orderBy(semesters.academicYear, semesters.name);

  return { enrollment, student, subjects: subjectsWithGrades, classes: allClasses, semesters: allSemesters };
}

type GradeSubScores = {
  subjectId: number;
  dailyTest1?: string;
  dailyTest2?: string;
  dailyTest3?: string;
  dailyTest4?: string;
  dailyTest5?: string;
  dailyTest6?: string;
  dailyTest7?: string;
  dailyTest8?: string;
  dailyTest9?: string;
  dailyTest10?: string;
  midterm?: string;
  finalExam?: string;
  score?: string;
};

export async function saveStudentGrades(
  studentId: string,
  classId: number,
  semesterId: number,
  items: GradeSubScores[]
) {
  const session = await verifySession();
  const allowed = await hasPermission(session.userId, "grades.create");
  if (!allowed) {
    return { error: "Anda tidak memiliki izin." };
  }

  for (const item of items) {
    const data: Record<string, unknown> = {
      studentId,
      classId,
      semesterId,
      subjectId: item.subjectId,
      type: "knowledge",
      teacherId: session.userId,
    };

    if (item.dailyTest1) data.dailyTest1 = item.dailyTest1;
    if (item.dailyTest2) data.dailyTest2 = item.dailyTest2;
    if (item.dailyTest3) data.dailyTest3 = item.dailyTest3;
    if (item.dailyTest4) data.dailyTest4 = item.dailyTest4;
    if (item.dailyTest5) data.dailyTest5 = item.dailyTest5;
    if (item.dailyTest6) data.dailyTest6 = item.dailyTest6;
    if (item.dailyTest7) data.dailyTest7 = item.dailyTest7;
    if (item.dailyTest8) data.dailyTest8 = item.dailyTest8;
    if (item.dailyTest9) data.dailyTest9 = item.dailyTest9;
    if (item.dailyTest10) data.dailyTest10 = item.dailyTest10;
    if (item.midterm) data.midterm = item.midterm;
    if (item.finalExam) data.finalExam = item.finalExam;
    if (item.score) data.score = item.score;

    await db
      .insert(grades)
      .values(data as typeof grades.$inferInsert)
      .onDuplicateKeyUpdate({
        set: data as any,
      });
  }

  await writeAudit(session.userId, "grades.save", "enrollment", studentId, {
    studentId,
    semesterId,
    gradeCount: items.length,
  });

  revalidatePath(`/students/${studentId}/graduate`);
  return { success: true };
}

export async function pindahKelas(
  studentId: string,
  currentSemesterId: number,
  targetClassId: number,
  targetSemesterId: number
) {
  const session = await verifySession();
  const allowed = await hasPermission(session.userId, "students.update");
  if (!allowed) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [enrollment] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.semesterId, currentSemesterId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!enrollment) {
    return { error: "Enrollment tidak ditemukan." };
  }

  const [existing] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.semesterId, targetSemesterId),
        sql`${enrollments.id} != ${enrollment.id}`,
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (existing) {
    return { error: "Siswa sudah terdaftar di semester target." };
  }

  const sameSemester = currentSemesterId === targetSemesterId;

  await db.transaction(async (tx) => {
    if (sameSemester) {
      // Same semester: just update the class on the existing enrollment
      await tx
        .update(enrollments)
        .set({ classId: targetClassId })
        .where(eq(enrollments.id, enrollment.id));
    } else {
      // Different semester: mark old as transferred, insert new
      await tx
        .update(enrollments)
        .set({ status: "transferred" })
        .where(eq(enrollments.id, enrollment.id));

      await tx.insert(enrollments).values({
        studentId,
        semesterId: targetSemesterId,
        classId: targetClassId,
        status: "active",
      });
    }
  });

  await writeAudit(session.userId, "student.promote", "enrollment", studentId, {
    studentId,
    fromSemesterId: currentSemesterId,
    toSemesterId: targetSemesterId,
    toClassId: targetClassId,
  });

  revalidatePath("/students/manage-class");
  return { success: true };
}
