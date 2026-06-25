"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import { auditLogs, classes, enrollments } from "@/lib/db/schema";
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
    const issue = parsed.error.issues[0]; return { error: issue ? issue.message : "Data tidak valid." };
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
  revalidatePath("/students/promote");
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
    const issue = parsed.error.issues[0]; return { error: issue ? issue.message : "Data tidak valid." };
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
  revalidatePath("/students/promote");
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
    const issue = parsed.error.issues[0]; return { error: issue ? issue.message : "Data tidak valid." };
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
  revalidatePath("/students/promote");
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
    const issue = parsed.error.issues[0]; return { error: issue ? issue.message : "Data tidak valid." };
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

  await db
    .update(enrollments)
    .set({ status: "graduated" })
    .where(eq(enrollments.id, enrollment.id));

  await writeAudit(
    session.userId,
    "student.graduate",
    "enrollment",
    String(enrollment.id),
    {
      studentId: parsed.data.studentId,
      semesterId: parsed.data.semesterId,
    }
  );

  revalidatePath("/students");
  revalidatePath(`/students/${parsed.data.studentId}`);
  revalidatePath("/students/promote");
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
