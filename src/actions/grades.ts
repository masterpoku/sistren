'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getGrades, inputGrade, updateGrade, deleteGrade } from '@/lib/db/queries'

export async function fetchGrades(userId?: number, semesterId?: number, enrollmentId?: number) {
  await verifySession()
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
  await verifySession()

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
  await verifySession()

  const updateFields: Record<string, unknown> = {}
  
  if (data.score !== undefined) updateFields.score = data.score
  if (data.grade !== undefined) updateFields.grade = data.grade
  if (data.predicate !== undefined) updateFields.predicate = data.predicate

  return await updateGrade(data.id, updateFields)
}

export async function deleteGradeAction(id: number) {
  await verifySession()
  return await deleteGrade(id)
}