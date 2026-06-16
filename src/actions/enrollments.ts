"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  auditLogs,
  classes,
  enrollments,
  roles,
  semesters,
  users,
} from "@/lib/db/schema";
import { updateEnrollmentSchema } from "@/lib/validation/schemas/enrollments";

export async function getEnrollments(opts?: {
  semesterId?: string;
  status?: string;
}) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (!ctx) {
    return [];
  }

  const conditions = [isNull(enrollments.deletedAt)];

  if (ctx.roleLevel < 60) {
    conditions.push(eq(enrollments.studentId, session.userId));
  }

  if (opts?.semesterId) {
    conditions.push(eq(enrollments.semesterId, Number(opts.semesterId)));
  }
  if (opts?.status) {
    conditions.push(
      eq(
        enrollments.status,
        opts.status as "active" | "transferred" | "dropped" | "graduated"
      )
    );
  }

  return db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      semesterId: enrollments.semesterId,
      classId: enrollments.classId,
      status: enrollments.status,
      studentName: users.name,
      studentEmail: users.email,
      className: classes.name,
      semesterName: semesters.name,
      academicYear: semesters.academicYear,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(semesters, eq(enrollments.semesterId, semesters.id))
    .where(and(...conditions))
    .orderBy(desc(enrollments.createdAt));
}

export async function getAvailableStudents() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (!ctx || ctx.roleLevel < 80) {
    return [];
  }

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(roles.level, 40), isNull(users.deletedAt)))
    .orderBy(users.name);
}

export async function createEnrollment(formData: FormData) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const studentId = formData.get("studentId") as string;
  const semesterId = formData.get("semesterId") as string;
  const classId = formData.get("classId") as string;

  if (!studentId || !semesterId || !classId) {
    return { error: "Semua field wajib diisi." };
  }

  const [student] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, studentId), isNull(users.deletedAt)))
    .limit(1);

  if (!student) {
    return { error: "Siswa tidak ditemukan." };
  }

  const [existing] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.semesterId, Number(semesterId)),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (existing) {
    return { error: "Siswa sudah terdaftar untuk semester ini." };
  }

  await db.insert(enrollments).values({
    studentId,
    semesterId: Number(semesterId),
    classId: Number(classId),
    status: "active",
  });

  revalidatePath("/enrollments");
  return { success: true };
}

export async function deleteEnrollment(enrollmentId: string) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [existing] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.id, Number(enrollmentId)),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Pendaftaran tidak ditemukan." };
  }

  await db
    .update(enrollments)
    .set({ deletedAt: new Date() })
    .where(eq(enrollments.id, Number(enrollmentId)));

  revalidatePath("/enrollments");
  return { success: true };
}

export async function bulkCreateEnrollment(
  classId: string,
  semesterId: string
) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  if (!classId || !semesterId) {
    return { error: "Kelas dan semester wajib dipilih." };
  }

  const targetClassId = Number(classId);
  const targetSemesterId = Number(semesterId);

  // Only get students from the specified class (via enrollments)
  const studentsInClass = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(enrollments, eq(enrollments.studentId, users.id))
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(
      and(
        eq(roles.level, 40),
        eq(enrollments.classId, targetClassId),
        eq(enrollments.semesterId, targetSemesterId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt),
        isNull(users.deletedAt)
      )
    )
    .groupBy(users.id)
    .limit(200);

  if (studentsInClass.length === 0) {
    return {
      inserted: 0,
      skipped: 0,
      message: "Tidak ada siswa di kelas ini.",
    };
  }

  const CHUNK_SIZE = 50;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < studentsInClass.length; i += CHUNK_SIZE) {
    const chunk = studentsInClass.slice(i, i + CHUNK_SIZE);

    try {
      await db.transaction(async (tx) => {
        for (const student of chunk) {
          const [existing] = await tx
            .select({ id: enrollments.id })
            .from(enrollments)
            .where(
              and(
                eq(enrollments.studentId, student.id),
                eq(enrollments.semesterId, targetSemesterId),
                isNull(enrollments.deletedAt)
              )
            )
            .limit(1);

          if (existing) {
            skipped++;
            continue;
          }

          await tx.insert(enrollments).values({
            studentId: student.id,
            semesterId: targetSemesterId,
            classId: targetClassId,
            status: "active",
          });
          inserted++;
        }
      });
    } catch {
      return {
        inserted,
        skipped,
        failed: true,
        message: `Batch gagal pada siswa ke-${i + 1}. Data sebelum batch ini sudah committed.`,
      };
    }
  }

  return { inserted, skipped, failed: false };
}

export async function updateEnrollment(
  enrollmentId: string,
  formData: FormData
) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const parsed = updateEnrollmentSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
    studentId: formData.get("studentId"),
    semesterId: formData.get("semesterId"),
    classId: formData.get("classId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { studentId, semesterId, classId } = parsed.data;

  if (Number(enrollmentId) !== parsed.data.enrollmentId) {
    return { error: "ID pendaftaran tidak cocok." };
  }

  const [existing] = await db
    .select({ id: enrollments.id, status: enrollments.status })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.id, parsed.data.enrollmentId),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Pendaftaran tidak ditemukan." };
  }

  if (existing.status !== "active") {
    return { error: "Hanya pendaftaran aktif yang dapat diubah." };
  }

  const [student] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, studentId), isNull(users.deletedAt)))
    .limit(1);

  if (!student) {
    return { error: "Siswa tidak ditemukan." };
  }

  const [duplicate] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.semesterId, semesterId),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (duplicate && duplicate.id !== existing.id) {
    return { error: "Siswa sudah terdaftar untuk semester ini." };
  }

  await db
    .update(enrollments)
    .set({ studentId, semesterId, classId })
    .where(eq(enrollments.id, parsed.data.enrollmentId));

  await db.insert(auditLogs).values({
    userId: session.userId,
    action: "enrollment.updated",
    entityType: "enrollment",
    entityId: parsed.data.enrollmentId,
    metadata: { changes: { studentId, semesterId, classId } },
  });

  revalidatePath("/enrollments");
  return { success: true };
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  newStatus: "active" | "transferred" | "dropped" | "graduated"
) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);

  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [existing] = await db
    .select({ id: enrollments.id, status: enrollments.status })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.id, Number(enrollmentId)),
        isNull(enrollments.deletedAt)
      )
    )
    .limit(1);

  if (!existing) {
    return { error: "Pendaftaran tidak ditemukan." };
  }

  if (existing.status === "dropped") {
    return { error: "Status tidak dapat diubah lagi." };
  }

  if (existing.status === "transferred" && newStatus !== "dropped") {
    return { error: "Hanya dapat mengubah ke dropout." };
  }

  await db
    .update(enrollments)
    .set({ status: newStatus })
    .where(eq(enrollments.id, Number(enrollmentId)));

  await db.insert(auditLogs).values({
    userId: session.userId,
    action: "enrollment.status_change",
    entityType: "enrollment",
    entityId: Number(enrollmentId),
    metadata: {
      changes: {
        from: existing.status,
        to: newStatus,
      },
    },
  });

  revalidatePath("/enrollments");
  return { success: true };
}
