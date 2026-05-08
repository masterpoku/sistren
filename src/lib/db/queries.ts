import { db } from './index'
import { users, announcements, payments, classes, majors, semesters, profiles, subjects, enrollments, grades } from './schema'
import { eq, desc, count, and, inArray } from 'drizzle-orm'
import { getUserWithRole } from './queries-user'
import { getEnrollmentsWithRelations, getEnrollmentByIdWithRelations, getProfilesWithRelations } from './queries-joins'

/**
 * Get grades with subject and semester info using manual joins.
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
      score: grades.score,
      grade: grades.grade,
      predicate: grades.predicate,
      createdAt: grades.createdAt,
      // Subject info
      subjectName: subjects.name,
      subjectCode: subjects.code,
      // Semester info
      semesterName: semesters.name,
    })
    .from(grades)
    .leftJoin(subjects, eq(grades.subjectId, subjects.id))
    .leftJoin(semesters, eq(grades.semesterId, semesters.id))

  if (filters?.enrollmentId) {
    return query.where(eq(grades.enrollmentId, filters.enrollmentId))
  }

  if (filters?.userId) {
    // Get enrollment IDs for this user
    const userEnrollments = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(eq(enrollments.studentId, filters.userId))
    
    const enrollmentIds = userEnrollments.map(e => e.id)
    if (enrollmentIds.length === 0) return []
    
    return query.where(inArray(grades.enrollmentId, enrollmentIds))
  }

  if (filters?.semesterId) {
    return query.where(eq(grades.semesterId, filters.semesterId))
  }

  return query
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
    db.select({ count: count() }).from(users).where(eq(users.roleId, 4)),
    db.select({ count: count() }).from(users).where(eq(users.roleId, 3)),
    db.select({ count: count() }).from(announcements),
    db.select({ count: count() }).from(payments).where(eq(payments.status, 'pending')),
    db.select({ count: count() }).from(classes),
    db.select({ count: count() }).from(majors),
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
    .where(eq(users.roleId, 4))
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
    .where(eq(users.roleId, 3))
}

export async function getAnnouncements(limit = 10) {
  return db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt))
    .limit(limit)
}

export async function getPayments(userId?: number, roleId?: number) {
  if (userId && roleId === 4) {
    return db
      .select()
      .from(payments)
      .where(eq(payments.studentId, userId))
  }
  return db.select().from(payments)
}

export async function getUserById(id: number) {
  return getUserWithRole(id)
}

export async function getClasses() {
  return db.select().from(classes)
}

export async function getMajors() {
  return db.select().from(majors)
}

export async function getSemesters() {
  return db.select().from(semesters).orderBy(desc(semesters.isActive))
}

export async function getAllUsers() {
  return db.select().from(users)
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
    phone: r.phone,
    address: r.address,
    birthPlace: r.birthPlace,
    birthDate: r.birthDate,
    gender: r.gender,
    religion: r.religion,
    majorId: r.majorId,
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
  return db.delete(profiles).where(eq(profiles.userId, userId))
}

// ============================================
// SUBJECTS CRUD
// ============================================

export async function getSubjects(filters?: { classId?: number; majorId?: number }) {
  if (filters?.classId && filters?.majorId) {
    return db.query.subjects.findMany({
      where: and(
        eq(subjects.classId, filters.classId),
        eq(subjects.majorId, filters.majorId)
      ),
    })
  } else if (filters?.classId) {
    return db.query.subjects.findMany({
      where: eq(subjects.classId, filters.classId),
    })
  }
  return db.select().from(subjects)
}

export async function getSubjectById(id: number) {
  return db.query.subjects.findFirst({
    where: eq(subjects.id, id),
  })
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
  return db.delete(subjects).where(eq(subjects.id, id))
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
  return db.delete(enrollments).where(eq(enrollments.id, id))
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
    .where(eq(grades.id, id))
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

export async function deleteGrade(id: number) {
  return db.delete(grades).where(eq(grades.id, id))
}

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
    .where(eq(payments.id, id))
  return result
}

export async function cancelPayment(id: number) {
  const result = await db.update(payments)
    .set({ status: 'cancelled' })
    .where(eq(payments.id, id))
  return result
}

export async function deletePayment(id: number) {
  return db.delete(payments).where(eq(payments.id, id))
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
    .where(eq(payments.id, id))
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
    .where(eq(payments.studentId, userId))
    .orderBy(desc(payments.createdAt))
}