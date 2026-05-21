'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getGradesWithRelations, getEnrollments } from '@/lib/db/queries'

export async function fetchGrades(userId?: number, semesterId?: number, enrollmentId?: number) {
  await verifyPermission('grades.read_any')
  return await getGradesWithRelations({ userId, semesterId, enrollmentId })
}

export async function fetchEnrollmentOptions() {
  await verifyPermission('grades.read_any')
  return await getEnrollments()
}

export interface InputGradeData {
  enrollmentId: number
  subjectId: number
  semesterId: number
  score: string
  grade: string
  predicate?: string
}

export async function inputGradeAction(_data: InputGradeData): Promise<{ success: true } | { success: false; error: string }> {
  return { success: false, error: 'Grades not yet implemented' }
}

export interface UpdateGradeData {
  id: number
  score?: string
  grade?: string
  predicate?: string
}

export async function updateGradeAction(_data: UpdateGradeData): Promise<{ success: true } | { success: false; error: string }> {
  return { success: false, error: 'Grades not yet implemented' }
}

// NOTE: deleteGradeAction is intentionally NOT provided.
// Grades are immutable academic records and should NEVER be hard-deleted.
// If correction is needed, use updateGradeAction to update the score.