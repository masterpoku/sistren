import { db } from './index'
import { users, announcements, payments, classes, majors, semesters } from './schema'
import { eq, desc, count } from 'drizzle-orm'

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