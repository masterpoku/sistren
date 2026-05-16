'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getEnrollments, createEnrollment, updateEnrollment, deleteEnrollment } from '@/lib/db/queries'

export async function fetchEnrollments(userId?: number, semesterId?: number) {
  await verifyPermission('enrollments.read')
  return await getEnrollments({ userId, semesterId })
}

export interface CreateEnrollmentData {
  studentId: number
  classId: number
  semesterId: number
}

export async function createEnrollmentAction(data: CreateEnrollmentData) {
  await verifyPermission('enrollments.create')

  return await createEnrollment({
    studentId: data.studentId,
    classId: data.classId,
    semesterId: data.semesterId,
  })
}

export interface UpdateEnrollmentData {
  id: number
  classId?: number
  semesterId?: number
}

export async function updateEnrollmentAction(data: UpdateEnrollmentData) {
  await verifyPermission('enrollments.update')

  const updateFields: Record<string, unknown> = {}
  
  if (data.classId !== undefined) updateFields.classId = data.classId
  if (data.semesterId !== undefined) updateFields.semesterId = data.semesterId

  return await updateEnrollment(data.id, updateFields)
}

export async function deleteEnrollmentAction(id: number) {
  await verifyPermission('enrollments.delete')
  return await deleteEnrollment(id)
}