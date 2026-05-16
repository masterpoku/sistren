'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getGrades, inputGrade, updateGrade } from '@/lib/db/queries'

export async function fetchGrades(userId?: number, semesterId?: number, enrollmentId?: number) {
  await verifyPermission('grades.read_any')
  return await getGrades({ userId, semesterId, enrollmentId })
}

export interface InputGradeData {
  enrollmentId: number
  subjectId: number
  semesterId: number
  score: string
  grade: string
  predicate?: string
}

export async function inputGradeAction(data: InputGradeData) {
  await verifyPermission('grades.input')

  return await inputGrade({
    enrollmentId: data.enrollmentId,
    subjectId: data.subjectId,
    semesterId: data.semesterId,
    score: data.score,
    grade: data.grade,
    predicate: data.predicate || null,
  })
}

export interface UpdateGradeData {
  id: number
  score?: string
  grade?: string
  predicate?: string
}

export async function updateGradeAction(data: UpdateGradeData) {
  await verifyPermission('grades.input')

  const updateFields: Record<string, unknown> = {}
  
  if (data.score !== undefined) updateFields.score = data.score
  if (data.grade !== undefined) updateFields.grade = data.grade
  if (data.predicate !== undefined) updateFields.predicate = data.predicate

  return await updateGrade(data.id, updateFields)
}

// NOTE: deleteGradeAction is intentionally NOT provided.
// Grades are immutable academic records and should NEVER be hard-deleted.
// If correction is needed, use updateGradeAction to update the score.