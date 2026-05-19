import { db } from './index'
import { users, announcements, payments, classes, majors, semesters, profiles, subjects, enrollments, grades } from './schema'
import { eq, desc, count, and, inArray, isNull } from 'drizzle-orm'
import { getUserWithRole } from './queries-user'
import { getEnrollmentsWithRelations, getEnrollmentByIdWithRelations, getProfilesWithRelations } from './queries-joins'

/**
 * Get grades with subject and semester info using manual joins.
 * Filters soft-deleted records from grades, subjects, semesters, and enrollments.
 */
export async function getGradesWithRelations(filters?: { 
  userId?: number 
  semesterId?: number 
  enrollmentId?: number 
}) {
  let query = db
    .select({
      id: grades.id,
      enrollmentId: grades.enrollmentId,
      subjectId: grades.subjectId,
      semesterId: grades.semesterId,
      score: grades.score,
      grade: grades.grade,
      predicate: grades.predicate,
      createdAt: grades.createdAt,
      // Subject info
      subjectName: subjects.name,
      subjectCode: subjects.code,
      // Semester info
      semesterName: semesters.name,
      // Enrollment info (for student/class)
      studentName: users.name,
      className: classes.name,
    })
    .from(grades)
    .leftJoin(subjects, eq(grades.subjectId, subjects.id))
    .leftJoin(semesters, eq(grades.semesterId, semesters.id))
    .leftJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
    .leftJoin(users, eq(enrollments.studentId, users.id))
    .leftJoin(classes, eq(enrollments.classId, classes.id))

  // Apply soft-delete filters
  const baseCondition = and(
    isNull(grades.deletedAt),
    isNull(subjects.deletedAt),
    isNull(semesters.deletedAt),
    isNull(enrollments.deletedAt),
    isNull(users.deletedAt),
    isNull(classes.deletedAt)
  )

  if (filters?.enrollmentId) {
    return query.where(and(baseCondition, eq(grades.enrollmentId, filters.enrollmentId)))
  }

  if (filters?.userId) {
    // Get enrollment IDs for this user (only active enrollments)
    const userEnrollments = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.studentId, filters.userId), isNull(enrollments.deletedAt)))
    
    const enrollmentIds = userEnrollments.map(e => e.id)
    if (enrollmentIds.length === 0) return []
    
    return query.where(and(baseCondition, inArray(grades.enrollmentId, enrollmentIds)))
  }

  if (filters?.semesterId) {
    return query.where(and(baseCondition, eq(grades.semesterId, filters.semesterId)))
  }

  return query.where(baseCondition)
}

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalAnnouncements: number
  pendingPayments: number
  totalClasses: number
  totalMajors: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    studentCountResult,
    teacherCountResult,
    announcementCountResult,
    paymentCountResult,
    classCountResult,
    majorCountResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(users).where(and(eq(users.roleId, 4), isNull(users.deletedAt))),
    db.select({ count: count() }).from(users).where(and(eq(users.roleId, 3), isNull(users.deletedAt))),
    db.select({ count: count() }).from(announcements).where(isNull(announcements.deletedAt)),
    db.select({ count: count() }).from(payments).where(and(eq(payments.status, 'pending'), isNull(payments.deletedAt))),
    db.select({ count: count() }).from(classes).where(isNull(classes.deletedAt)),
    db.select({ count: count() }).from(majors).where(isNull(majors.deletedAt)),
  ])

  return {
    totalStudents: Number(studentCountResult[0]?.count ?? 0),
    totalTeachers: Number(teacherCountResult[0]?.count ?? 0),
    totalAnnouncements: Number(announcementCountResult[0]?.count ?? 0),
    pendingPayments: Number(paymentCountResult[0]?.count ?? 0),
    totalClasses: Number(classCountResult[0]?.count ?? 0),
    totalMajors: Number(majorCountResult[0]?.count ?? 0),
  }
}

export async function getStudents() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
    })
    .from(users)
    .where(and(eq(users.roleId, 4), isNull(users.deletedAt)))
}

export async function getTeachers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
    })
    .from(users)
    .where(and(eq(users.roleId, 3), isNull(users.deletedAt)))
}

export async function getAnnouncements(limit = 10) {
  return db
    .select()
    .from(announcements)
    .where(isNull(announcements.deletedAt))
    .orderBy(desc(announcements.createdAt))
    .limit(limit)
}

export async function getPayments(userId?: number, roleId?: number) {
  if (userId && roleId === 4) {
    return db
      .select()
      .from(payments)
      .where(and(eq(payments.studentId, userId), isNull(payments.deletedAt)))
  }
  return db.select().from(payments).where(isNull(payments.deletedAt))
}

export async function getUserById(id: number) {
  return getUserWithRole(id)
}

export async function getClasses() {
  return db.select().from(classes).where(isNull(classes.deletedAt))
}

export async function getMajors() {
  return db.select().from(majors).where(isNull(majors.deletedAt))
}

export async function getSemesters() {
  return db.select().from(semesters).where(isNull(semesters.deletedAt)).orderBy(desc(semesters.isActive))
}

export async function getAllUsers() {
  return db.select().from(users).where(isNull(users.deletedAt))
}

export async function getUserRole(userId: number) {
  const user = await getUserWithRole(userId)
  return user?.role ?? null
}

// ============================================
// PROFILES CRUD
// ============================================

export async function getProfile(userId: number) {
  const results = await getProfilesWithRelations(userId)
  if (results.length === 0) return null
  const r = results[0]
  return {
    id: r.id,
    userId: r.userId,
    nik: r.nik,
    nisn: r.nisn,
    phone: r.phone,
    address: r.address,
    birthPlace: r.birthPlace,
    birthDate: r.birthDate,
    gender: r.gender,
    religion: r.religion,
    majorId: r.majorId,
    fatherName: r.fatherName,
    motherName: r.motherName,
    parentsPhone: r.parentsPhone,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: r.userName ? { name: r.userName, email: r.userEmail!, roleId: r.roleId } : null,
    major: r.majorName ? { id: r.majorId, name: r.majorName } : null,
  }
}

export async function getAllProfiles() {
  return getProfilesWithRelations()
}

export async function createProfile(data: typeof profiles.$inferInsert) {
  const result = await db.insert(profiles).values(data)
  return result
}

export async function updateProfile(userId: number, data: Partial<typeof profiles.$inferInsert>) {
  const result = await db.update(profiles).set(data).where(eq(profiles.userId, userId))
  return result
}

export async function deleteProfile(userId: number) {
  // Soft delete profile
  return db.update(profiles).set({ deletedAt: new Date() }).where(eq(profiles.userId, userId))
}

// ============================================
// SUBJECTS CRUD
// ============================================

export async function getSubjects(filters?: { classId?: number; majorId?: number }) {
  const conditions = [isNull(subjects.deletedAt)] as any[]
  if (filters?.classId) conditions.push(eq(subjects.classId, filters.classId))
  if (filters?.majorId) conditions.push(eq(subjects.majorId, filters.majorId))

  return db
    .select({
      id: subjects.id,
      name: subjects.name,
      code: subjects.code,
      classId: subjects.classId,
      majorId: subjects.majorId,
      credits: subjects.credits,
      description: subjects.description,
      className: classes.name,
      majorName: majors.name,
    })
    .from(subjects)
    .leftJoin(classes, eq(subjects.classId, classes.id))
    .leftJoin(majors, eq(subjects.majorId, majors.id))
    .where(and(...conditions))
}

export async function getSubjectById(id: number) {
  const results = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.id, id), isNull(subjects.deletedAt)))
    .limit(1)
  return results[0] ?? null
}

export async function createSubject(data: typeof subjects.$inferInsert) {
  const result = await db.insert(subjects).values(data)
  return result
}

export async function updateSubject(id: number, data: Partial<typeof subjects.$inferInsert>) {
  const result = await db.update(subjects).set(data).where(eq(subjects.id, id))
  return result
}

export async function deleteSubject(id: number) {
  // Soft delete
  return db.update(subjects).set({ deletedAt: new Date() }).where(eq(subjects.id, id))
}

// ============================================
// ENROLLMENTS CRUD (KRS)
// ============================================

export async function getEnrollments(filters?: { userId?: number; semesterId?: number }) {
  return getEnrollmentsWithRelations(filters)
}

export async function getEnrollmentById(id: number) {
  return getEnrollmentByIdWithRelations(id)
}

export async function createEnrollment(data: typeof enrollments.$inferInsert) {
  const result = await db.insert(enrollments).values(data)
  return result
}

export async function updateEnrollment(id: number, data: Partial<typeof enrollments.$inferInsert>) {
  const result = await db.update(enrollments).set(data).where(eq(enrollments.id, id))
  return result
}

export async function deleteEnrollment(id: number) {
  // Soft delete
  return db.update(enrollments).set({ deletedAt: new Date() }).where(eq(enrollments.id, id))
}

// ============================================
// GRADES CRUD (KHS)
// ============================================

export async function getGrades(filters?: { userId?: number; semesterId?: number; enrollmentId?: number }) {
  return getGradesWithRelations(filters)
}

export async function getGradeById(id: number) {
  const results = await db
    .select({
      id: grades.id,
      enrollmentId: grades.enrollmentId,
      subjectId: grades.subjectId,
      semesterId: grades.semesterId,
      score: grades.score,
      grade: grades.grade,
      predicate: grades.predicate,
      createdAt: grades.createdAt,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      semesterName: semesters.name,
    })
    .from(grades)
    .leftJoin(subjects, eq(grades.subjectId, subjects.id))
    .leftJoin(semesters, eq(grades.semesterId, semesters.id))
    .where(and(eq(grades.id, id), isNull(grades.deletedAt)))
    .limit(1)
  
  return results[0] ?? null
}

export async function inputGrade(data: typeof grades.$inferInsert) {
  const result = await db.insert(grades).values(data)
  return result
}

export async function updateGrade(id: number, data: Partial<typeof grades.$inferInsert>) {
  const result = await db.update(grades).set(data).where(eq(grades.id, id))
  return result
}

// No deleteGrade — grades are immutable academic records

// ============================================
// PAYMENTS WRITE OPERATIONS
// ============================================

export async function createPayment(data: typeof payments.$inferInsert) {
  const result = await db.insert(payments).values(data)
  return result
}

export async function updatePayment(id: number, data: Partial<typeof payments.$inferInsert>) {
  const result = await db.update(payments).set(data).where(eq(payments.id, id))
  return result
}

export async function markPaymentAsPaid(id: number) {
  const result = await db.update(payments)
    .set({ status: 'paid', paidAt: new Date() })
    .where(and(eq(payments.id, id), isNull(payments.deletedAt)))
  return result
}

export async function cancelPayment(id: number) {
  const result = await db.update(payments)
    .set({ status: 'cancelled' })
    .where(and(eq(payments.id, id), isNull(payments.deletedAt)))
  return result
}

export async function deletePayment(id: number) {
  // Soft delete
  return db.update(payments).set({ deletedAt: new Date() }).where(eq(payments.id, id))
}

export async function getPaymentById(id: number) {
  const results = await db
    .select({
      id: payments.id,
      studentId: payments.studentId,
      code: payments.code,
      description: payments.description,
      price: payments.price,
      quantity: payments.quantity,
      total: payments.total,
      orderData: payments.orderData,
      status: payments.status,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(payments)
    .leftJoin(users, eq(payments.studentId, users.id))
    .where(and(eq(payments.id, id), isNull(payments.deletedAt)))
    .limit(1)
  
  if (results.length === 0) return null
  
  const r = results[0]
  return {
    ...r,
    student: r.studentName ? { name: r.studentName, email: r.studentEmail } : null,
  }
}

export async function getStudentPayments(userId: number) {
  return db
    .select({
      id: payments.id,
      studentId: payments.studentId,
      code: payments.code,
      description: payments.description,
      price: payments.price,
      quantity: payments.quantity,
      total: payments.total,
      status: payments.status,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(and(eq(payments.studentId, userId), isNull(payments.deletedAt)))
    .orderBy(desc(payments.createdAt))
}