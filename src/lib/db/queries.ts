import { db } from './index'
import { users, announcements, payments, classes, majors, semesters, profiles, subjects, enrollments, grades } from './schema'
import { eq, desc, count, and } from 'drizzle-orm'

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
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: { role: true },
  })
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
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { role: true },
  })
  return user?.role ?? null
}

// ============================================
// PROFILES CRUD
// ============================================

export async function getProfile(userId: number) {
  return db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    with: { user: true, major: true },
  })
}

export async function getAllProfiles() {
  return db.query.profiles.findMany({
    with: { user: true, major: true },
  })
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
  if (filters?.userId && filters?.semesterId) {
    return db.query.enrollments.findMany({
      where: and(
        eq(enrollments.studentId, filters.userId),
        eq(enrollments.semesterId, filters.semesterId)
      ),
      with: { student: true, class: true, semester: true },
    })
  } else if (filters?.userId) {
    return db.query.enrollments.findMany({
      where: eq(enrollments.studentId, filters.userId),
      with: { student: true, class: true, semester: true },
    })
  }
  return db.query.enrollments.findMany({
    with: { student: true, class: true, semester: true },
  })
}

export async function getEnrollmentById(id: number) {
  return db.query.enrollments.findFirst({
    where: eq(enrollments.id, id),
    with: { student: true, class: true, semester: true },
  })
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
  if (filters?.enrollmentId) {
    return db.query.grades.findMany({
      where: eq(grades.enrollmentId, filters.enrollmentId),
      with: { subject: true, semester: true },
    })
  }
  
  // Get grades for a student's enrollments
  if (filters?.userId) {
    const userEnrollments = await db.query.enrollments.findMany({
      where: eq(enrollments.studentId, filters.userId),
    })
    const enrollmentIds = userEnrollments.map(e => e.id)
    
    if (enrollmentIds.length === 0) return []
    
    return db.query.grades.findMany({
      with: { subject: true, semester: true },
    })
  }
  
  return db.select().from(grades)
}

export async function getGradeById(id: number) {
  return db.query.grades.findFirst({
    where: eq(grades.id, id),
    with: { subject: true, semester: true },
  })
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
  return db.query.payments.findFirst({
    where: eq(payments.id, id),
    with: { student: true },
  })
}

export async function getStudentPayments(userId: number) {
  return db.query.payments.findMany({
    where: eq(payments.studentId, userId),
    orderBy: [desc(payments.createdAt)],
  })
}