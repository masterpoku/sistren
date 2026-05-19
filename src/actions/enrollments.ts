'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment, getStudents } from '@/lib/db/queries'

export async function fetchEnrollments(userId?: number, semesterId?: number) {
  await verifyPermission('enrollments.read')
  return await getEnrollments({ userId, semesterId })
}

export async function fetchStudentOptions() {
  await verifyPermission('enrollments.read')
  return await getStudents()
}

export interface CreateEnrollmentData {
  studentId: number
  classId: number
  semesterId: number
}

export async function createEnrollmentAction(data: CreateEnrollmentData): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('enrollments.create')

  await createEnrollment({
    studentId: data.studentId,
    classId: data.classId,
    semesterId: data.semesterId,
  })
  return { success: true }
}

export interface UpdateEnrollmentData {
  id: number
  classId?: number
  semesterId?: number
}

export async function updateEnrollmentAction(data: UpdateEnrollmentData): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('enrollments.update')

  const updateFields: Record<string, unknown> = {}

  if (data.classId !== undefined) updateFields.classId = data.classId
  if (data.semesterId !== undefined) updateFields.semesterId = data.semesterId

  await updateEnrollment(data.id, updateFields)
  return { success: true }
}

export async function deleteEnrollmentAction(id: number): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('enrollments.delete')
  await deleteEnrollment(id)
  return { success: true }
}