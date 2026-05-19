'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getGrades, inputGrade, updateGrade, getEnrollments } from '@/lib/db/queries'

export async function fetchGrades(userId?: number, semesterId?: number, enrollmentId?: number) {
  await verifyPermission('grades.read_any')
  return await getGrades({ userId, semesterId, enrollmentId })
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

export async function inputGradeAction(data: InputGradeData): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('grades.input')

  await inputGrade({
    enrollmentId: data.enrollmentId,
    subjectId: data.subjectId,
    semesterId: data.semesterId,
    score: data.score,
    grade: data.grade,
    predicate: data.predicate || null,
  })
  return { success: true }
}

export interface UpdateGradeData {
  id: number
  score?: string
  grade?: string
  predicate?: string
}

export async function updateGradeAction(data: UpdateGradeData): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('grades.input')

  const updateFields: Record<string, unknown> = {}

  if (data.score !== undefined) updateFields.score = data.score
  if (data.grade !== undefined) updateFields.grade = data.grade
  if (data.predicate !== undefined) updateFields.predicate = data.predicate

  await updateGrade(data.id, updateFields)
  return { success: true }
}

// NOTE: deleteGradeAction is intentionally NOT provided.
// Grades are immutable academic records and should NEVER be hard-deleted.
// If correction is needed, use updateGradeAction to update the score.