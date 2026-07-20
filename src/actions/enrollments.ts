"use server";

import { and, desc, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/permissions";
import { verifySession } from "@/lib/auth/verify-session";
import { db } from "@/lib/db";
import {
  auditLogs,
  classes,
  enrollments,
  majors,
  profiles,
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
      classCode: classes.code,
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

export async function getStudentsByClass(classId: number) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 60) {
    return { error: "Anda tidak memiliki izin." };
  }

  const [classInfo] = await db
    .select({ id: classes.id, name: classes.name, code: classes.code })
    .from(classes)
    .where(and(eq(classes.id, classId), isNull(classes.deletedAt)))
    .limit(1);

  if (!classInfo) {
    return { error: "Kelas tidak ditemukan." };
  }

  const students = await db
    .select({
      enrollmentId: enrollments.id,
      studentId: enrollments.studentId,
      studentName: users.name,
      studentEmail: users.email,
      status: enrollments.status,
      semesterId: enrollments.semesterId,
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
    .orderBy(users.name);

  return { classInfo, students };
}

export async function getVerifiedStudents() {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  // Get IDs of students already enrolled in active classes
  const enrolled = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    );

  const enrolledIds = enrolled.map((r) => r.studentId);

  const students = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      nisn: profiles.nisn,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(roles.level, 40),
        eq(profiles.verificationStatus, "verified"),
        isNull(profiles.deletedAt),
        isNull(users.deletedAt),
        enrolledIds.length > 0 ? notInArray(users.id, enrolledIds) : undefined
      )
    )
    .orderBy(users.name);

  return { students };
}

async function getActiveSemesterId() {
  const [row] = await db
    .select({ id: semesters.id })
    .from(semesters)
    .where(and(eq(semesters.isActive, true), isNull(semesters.deletedAt)))
    .limit(1);

  if (row) return row.id;

  const [fallback] = await db
    .select({ id: semesters.id })
    .from(semesters)
    .where(isNull(semesters.deletedAt))
    .orderBy(semesters.academicYear, semesters.name)
    .limit(1);

  return fallback?.id ?? 0;
}

export async function addStudentToClass(
  studentId: string,
  classId: number
) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const semesterId = await getActiveSemesterId();
  if (!semesterId) {
    return { error: "Tidak ada semester aktif." };
  }

  const [existing] = await db
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

  if (existing) {
    return { error: "Siswa sudah terdaftar di semester ini." };
  }

  await db.insert(enrollments).values({
    studentId,
    classId,
    semesterId,
    status: "active",
  });

  revalidatePath("/students/manage-class");
  return { success: true };
}

export async function randomAssignToClass(
  classId: number,
  count: number
) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const semesterId = await getActiveSemesterId();
  if (!semesterId) {
    return { error: "Tidak ada semester aktif." };
  }

  const enrolled = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    );

  const enrolledIds = enrolled.map((r) => r.studentId);

  const available = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(roles.level, 40),
        eq(profiles.verificationStatus, "verified"),
        isNull(profiles.deletedAt),
        isNull(users.deletedAt),
        enrolledIds.length > 0 ? notInArray(users.id, enrolledIds) : undefined
      )
    );

  if (available.length === 0) {
    return { error: "Tidak ada siswa tersedia." };
  }

  const toAssign = available
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count || available.length, available.length));

  let inserted = 0;
  let skipped = 0;

  for (const student of toAssign) {
    const [existing] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, student.id),
          eq(enrollments.semesterId, semesterId),
          isNull(enrollments.deletedAt)
        )
      )
      .limit(1);

    if (existing) {
      skipped++;
      continue;
    }

    await db.insert(enrollments).values({
      studentId: student.id,
      classId,
      semesterId,
      status: "active",
    });
    inserted++;
  }

  revalidatePath("/students/manage-class");
  return { inserted, skipped };
}

export async function getUnassignedStudents(majorId?: number) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  const enrolled = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(and(eq(enrollments.status, "active"), isNull(enrollments.deletedAt)));

  const enrolledIds = enrolled.map((r) => r.studentId);

  const conditions = [
    eq(roles.level, 40),
    eq(profiles.verificationStatus, "verified"),
    isNull(profiles.deletedAt),
    isNull(users.deletedAt),
  ];

  if (majorId) conditions.push(eq(profiles.majorId, majorId));
  if (enrolledIds.length > 0) conditions.push(notInArray(users.id, enrolledIds));

  const students = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      nisn: profiles.nisn,
      majorId: profiles.majorId,
      majorName: majors.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(majors, eq(profiles.majorId, majors.id))
    .where(and(...conditions))
    .orderBy(users.name);

  return { students };
}

export async function batchAssignStudents(
  studentIds: string[],
  classId: number
) {
  const session = await verifySession();
  const ctx = await getAuthContext(session.userId);
  if (!ctx || ctx.roleLevel < 80) {
    return { error: "Anda tidak memiliki izin." };
  }

  if (!studentIds.length) return { error: "Tidak ada siswa dipilih." };

  const semesterId = await getActiveSemesterId();
  if (!semesterId) return { error: "Tidak ada semester aktif." };

  const [classInfo] = await db
    .select({ id: classes.id, capacity: classes.capacity })
    .from(classes)
    .where(and(eq(classes.id, classId), isNull(classes.deletedAt)))
    .limit(1);

  if (!classInfo) return { error: "Kelas tidak ditemukan." };

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.classId, classId),
        eq(enrollments.status, "active"),
        isNull(enrollments.deletedAt)
      )
    );

  const currentCount = Number(countResult.count);

  if (classInfo.capacity && currentCount + studentIds.length > classInfo.capacity) {
    const remaining = classInfo.capacity - currentCount;
    return {
      error: `Kapasitas kelas tidak mencukupi. Terisi ${currentCount}/${classInfo.capacity}. Hanya ${remaining} slot tersisa.`,
    };
  }

  const existing = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.semesterId, semesterId),
        inArray(enrollments.studentId, studentIds),
        isNull(enrollments.deletedAt)
      )
    );

  const existingIds = new Set(existing.map((r) => r.studentId));
  const toInsert = studentIds.filter((id) => !existingIds.has(id));

  if (!toInsert.length) return { error: "Semua siswa sudah terdaftar di semester ini." };

  let inserted = 0;
  await db.transaction(async (tx) => {
    for (const studentId of toInsert) {
      await tx.insert(enrollments).values({
        studentId,
        classId,
        semesterId,
        status: "active",
      });
      inserted++;
    }
  });

  revalidatePath("/students/manage-class");
  revalidatePath("/students/manage-class/unassigned");
  return { success: true, inserted, skipped: studentIds.length - inserted };
}
