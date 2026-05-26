'use server'

import { db } from '@/lib/db'
import { enrollments, users, semesters, classes, roles } from '@/lib/db/schema'
import { eq, isNull, and, desc } from 'drizzle-orm'
import { verifySession } from '@/lib/auth/verify-session'
import { getAuthContext } from '@/lib/auth/permissions'

export async function getEnrollments(semesterId?: string) {
  await verifySession()
  await getAuthContext((await verifySession()).userId)

  const base = db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      semesterId: enrollments.semesterId,
      classId: enrollments.classId,
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
    .where(isNull(enrollments.deletedAt))
    .orderBy(desc(enrollments.createdAt))

  if (semesterId) {
    return db
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        semesterId: enrollments.semesterId,
        classId: enrollments.classId,
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
      .where(and(
        eq(enrollments.semesterId, Number(semesterId)),
        isNull(enrollments.deletedAt)
      ))
      .orderBy(desc(enrollments.createdAt))
  }

  return base
}

export async function getAvailableStudents() {
  const session = await verifySession()
  const ctx = await getAuthContext(session.userId)

  if (!ctx || ctx.roleLevel < 80) {
    return []
  }

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(and(
      eq(roles.level, 40),
      isNull(users.deletedAt)
    ))
    .orderBy(users.name)
}

export async function createEnrollment(formData: FormData) {
  const session = await verifySession()
  const ctx = await getAuthContext(session.userId)

  if (!ctx || ctx.roleLevel < 80) {
    return { error: 'Anda tidak memiliki izin.' }
  }

  const studentId = formData.get('studentId') as string
  const semesterId = formData.get('semesterId') as string
  const classId = formData.get('classId') as string

  if (!studentId || !semesterId || !classId) {
    return { error: 'Semua field wajib diisi.' }
  }

  // Verify student exists
  const [student] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, studentId), isNull(users.deletedAt)))
    .limit(1)

  if (!student) {
    return { error: 'Siswa tidak ditemukan.' }
  }

  // Check duplicate
  const [existing] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(
      eq(enrollments.studentId, studentId),
      eq(enrollments.semesterId, Number(semesterId)),
      eq(enrollments.classId, Number(classId)),
      isNull(enrollments.deletedAt)
    ))
    .limit(1)

  if (existing) {
    return { error: 'Siswa sudah terdaftar di kelas ini untuk semester ini.' }
  }

  await db.insert(enrollments).values({
    studentId,
    semesterId: Number(semesterId),
    classId: Number(classId),
  })

  return { success: true }
}

export async function deleteEnrollment(enrollmentId: string) {
  const session = await verifySession()
  const ctx = await getAuthContext(session.userId)

  if (!ctx || ctx.roleLevel < 80) {
    return { error: 'Anda tidak memiliki izin.' }
  }

  const [existing] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.id, Number(enrollmentId)), isNull(enrollments.deletedAt)))
    .limit(1)

  if (!existing) {
    return { error: 'Pendaftaran tidak ditemukan.' }
  }

  await db.update(enrollments)
    .set({ deletedAt: new Date() })
    .where(eq(enrollments.id, Number(enrollmentId)))

  return { success: true }
}