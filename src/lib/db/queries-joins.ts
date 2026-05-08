import { db } from './index'
import { enrollments, classes, semesters, users, majors } from './schema'
import { eq, and } from 'drizzle-orm'

/**
 * Get enrollments with related data using manual joins (MariaDB compatible).
 */
export async function getEnrollmentsWithRelations(filters?: { userId?: number; semesterId?: number }) {
  let query = db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      semesterId: enrollments.semesterId,
      classId: enrollments.classId,
      createdAt: enrollments.createdAt,
      // Student info
      studentName: users.name,
      studentEmail: users.email,
      // Class info
      className: classes.name,
      classCode: classes.code,
      // Semester info
      semesterName: semesters.name,
      semesterActive: semesters.isActive,
    })
    .from(enrollments)
    .leftJoin(users, eq(enrollments.studentId, users.id))
    .leftJoin(classes, eq(enrollments.classId, classes.id))
    .leftJoin(semesters, eq(enrollments.semesterId, semesters.id))

  if (filters?.userId && filters?.semesterId) {
    return query.where(
      and(
        eq(enrollments.studentId, filters.userId),
        eq(enrollments.semesterId, filters.semesterId)
      )
    )
  } else if (filters?.userId) {
    return query.where(eq(enrollments.studentId, filters.userId))
  }

  return query
}

/**
 * Get enrollment by ID with relations.
 */
export async function getEnrollmentByIdWithRelations(id: number) {
  const result = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      semesterId: enrollments.semesterId,
      classId: enrollments.classId,
      createdAt: enrollments.createdAt,
      studentName: users.name,
      studentEmail: users.email,
      className: classes.name,
      classCode: classes.code,
      semesterName: semesters.name,
      semesterActive: semesters.isActive,
    })
    .from(enrollments)
    .leftJoin(users, eq(enrollments.studentId, users.id))
    .leftJoin(classes, eq(enrollments.classId, classes.id))
    .leftJoin(semesters, eq(enrollments.semesterId, semesters.id))
    .where(eq(enrollments.id, id))
    .limit(1)

  return result[0] ?? null
}

/**
 * Get profiles with user and major info using manual joins.
 */
export async function getProfilesWithRelations(userId?: number) {
  const { profiles } = await import('./schema')
  
  let query = db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      nik: profiles.nik,
      phone: profiles.phone,
      address: profiles.address,
      birthPlace: profiles.birthPlace,
      birthDate: profiles.birthDate,
      gender: profiles.gender,
      religion: profiles.religion,
      majorId: profiles.majorId,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
      userName: users.name,
      userEmail: users.email,
      roleId: users.roleId,
      majorName: majors.name,
    })
    .from(profiles)
    .leftJoin(users, eq(profiles.userId, users.id))
    .leftJoin(majors, eq(profiles.majorId, majors.id))

  if (userId) {
    return query.where(eq(profiles.userId, userId)).limit(1)
  }

  return query
}