'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { db } from '@/lib/db'
import { 
  classes, majors, semesters, subjects, 
  enrollments, profiles
} from '@/lib/db/schema'
import { eq, and, isNull, count, desc } from 'drizzle-orm'

// ==================== FETCH ====================

export async function fetchAcademic() {
  await verifyPermission('classes.manage')
  const [cls, mjr, sem] = await Promise.all([
    db.select().from(classes).where(isNull(classes.deletedAt)),
    db.select().from(majors).where(isNull(majors.deletedAt)),
    db.select().from(semesters).where(isNull(semesters.deletedAt)).orderBy(desc(semesters.isActive)),
  ])
  return { classes: cls, majors: mjr, semesters: sem }
}

// ==================== CLASSES ====================

export async function createClass(data: { name: string; code: string }): Promise<{ success: true; id: number } | { success: false; error: string }> {
  await verifyPermission('classes.manage')

  // Check duplicate code (active records only)
  const [existing] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(and(eq(classes.code, data.code), isNull(classes.deletedAt)))
    .limit(1)
  
  if (existing) {
    return { success: false, error: 'Kode kelas sudah digunakan' }
  }

  const [result] = await db.insert(classes).values({ name: data.name, code: data.code })
  return { success: true, id: result.insertId }
}

export async function updateClass(id: number, data: { name?: string; code?: string }): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('classes.manage')

  // Check duplicate code (exclude self, active only)
  if (data.code) {
    const [existing] = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.code, data.code), isNull(classes.deletedAt)))
      .limit(1)
    
    if (existing && existing.id !== id) {
      return { success: false, error: 'Kode kelas sudah digunakan' }
    }
  }

  const updateFields: Record<string, unknown> = {}
  if (data.name !== undefined) updateFields.name = data.name
  if (data.code !== undefined) updateFields.code = data.code

  await db.update(classes).set(updateFields).where(eq(classes.id, id))
  return { success: true }
}

export async function deleteClass(id: number): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('classes.manage')

  // GUARD: Check active enrollments
  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(and(eq(enrollments.classId, id), isNull(enrollments.deletedAt)))
  
  if ((enrollmentCount?.count ?? 0) > 0) {
    return { success: false, error: `Kelas memiliki ${enrollmentCount.count} enrollment aktif. Hapus enrollment terlebih dahulu.` }
  }

  // Soft delete
  await db.update(classes).set({ deletedAt: new Date() }).where(eq(classes.id, id))
  return { success: true }
}

// ==================== MAJORS ====================

export async function createMajor(data: { name: string; description?: string }): Promise<{ success: true; id: number } | { success: false; error: string }> {
  await verifyPermission('majors.manage')

  // Check duplicate name (active only)
  const [existing] = await db
    .select({ id: majors.id })
    .from(majors)
    .where(and(eq(majors.name, data.name), isNull(majors.deletedAt)))
    .limit(1)
  
  if (existing) {
    return { success: false, error: 'Nama jurusan sudah ada' }
  }

  const [result] = await db.insert(majors).values({ name: data.name, description: data.description || null })
  return { success: true, id: result.insertId }
}

export async function updateMajor(id: number, data: { name?: string; description?: string }): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('majors.manage')

  if (data.name) {
    const [existing] = await db
      .select({ id: majors.id })
      .from(majors)
      .where(and(eq(majors.name, data.name), isNull(majors.deletedAt)))
      .limit(1)
    
    if (existing && existing.id !== id) {
      return { success: false, error: 'Nama jurusan sudah ada' }
    }
  }

  const updateFields: Record<string, unknown> = {}
  if (data.name !== undefined) updateFields.name = data.name
  if (data.description !== undefined) updateFields.description = data.description

  await db.update(majors).set(updateFields).where(eq(majors.id, id))
  return { success: true }
}

export async function deleteMajor(id: number): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('majors.manage')

  // GUARD: Check active profiles (students/teachers) in this major
  const [profileCount] = await db
    .select({ count: count() })
    .from(profiles)
    .where(and(eq(profiles.majorId, id), isNull(profiles.deletedAt)))
  
  if ((profileCount?.count ?? 0) > 0) {
    return { success: false, error: `Jurusan memiliki ${profileCount.count} siswa/guru aktif. Hapus data peserta terlebih dahulu.` }
  }

  // Soft delete
  await db.update(majors).set({ deletedAt: new Date() }).where(eq(majors.id, id))
  return { success: true }
}

// ==================== SEMESTERS ====================

export async function createSemester(data: {
  name: string
  academicYear: string
  startDate?: string
  endDate?: string
}): Promise<{ success: true; id: number } | { success: false; error: string }> {
  await verifyPermission('semesters.manage')

  const [result] = await db.insert(semesters).values({
    name: data.name,
    academicYear: data.academicYear,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  })
  return { success: true, id: result.insertId }
}

export async function updateSemester(id: number, data: {
  name?: string
  academicYear?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('semesters.manage')

  const updateFields: Record<string, unknown> = {}
  if (data.name !== undefined) updateFields.name = data.name
  if (data.academicYear !== undefined) updateFields.academicYear = data.academicYear
  if (data.startDate !== undefined) updateFields.startDate = new Date(data.startDate)
  if (data.endDate !== undefined) updateFields.endDate = new Date(data.endDate)

  // Special handling for isActive — only one active semester at a time
  if (data.isActive === true) {
    await db.transaction(async (tx) => {
      // Deactivate all others
      await tx.update(semesters)
        .set({ isActive: false })
        .where(and(eq(semesters.isActive, true), isNull(semesters.deletedAt)))
      // Activate this one
      await tx.update(semesters)
        .set({ ...updateFields, isActive: true })
        .where(eq(semesters.id, id))
    })
  } else {
    if (data.isActive !== undefined) updateFields.isActive = data.isActive
    await db.update(semesters).set(updateFields).where(eq(semesters.id, id))
  }

  return { success: true }
}

export async function deleteSemester(id: number): Promise<{ success: true } | { success: false; error: string }> {
  await verifyPermission('semesters.manage')

  // GUARD: Check active enrollments
  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(and(eq(enrollments.semesterId, id), isNull(enrollments.deletedAt)))
  
  if ((enrollmentCount?.count ?? 0) > 0) {
    return { success: false, error: `Semester memiliki ${enrollmentCount.count} enrollment aktif. Hapus enrollment terlebih dahulu.` }
  }

  // Soft delete
  await db.update(semesters).set({ deletedAt: new Date() }).where(eq(semesters.id, id))
  return { success: true }
}

// ==================== SUBJECTS ====================

export async function fetchSubjects(filters?: { classId?: number; majorId?: number }) {
  await verifyPermission('subjects.manage')
  
  const { getSubjects } = await import('@/lib/db/queries')
  return await getSubjects(filters)
}

export async function createSubject(data: {
  name: string
  code?: string
  classId: number
  majorId?: number
  credits?: number
  description?: string
}) {
  await verifyPermission('subjects.manage')

  // Check duplicate code (if provided, active only)
  if (data.code) {
    const [existing] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.code, data.code), isNull(subjects.deletedAt)))
      .limit(1)
    
    if (existing) {
      return { success: false, error: 'Kode mapel sudah digunakan' }
    }
  }

  const [result] = await db.insert(subjects).values({
    name: data.name,
    code: data.code || null,
    classId: data.classId,
    majorId: data.majorId || null,
    credits: data.credits || 0,
    description: data.description || null,
  })
  return { success: true, id: result.insertId }
}

export async function updateSubject(id: number, data: {
  name?: string
  code?: string
  classId?: number
  majorId?: number
  credits?: number
  description?: string
}) {
  await verifyPermission('subjects.manage')

  if (data.code) {
    const [existing] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.code, data.code), isNull(subjects.deletedAt)))
      .limit(1)
    
    if (existing && existing.id !== id) {
      return { success: false, error: 'Kode mapel sudah digunakan' }
    }
  }

  const updateFields: Record<string, unknown> = {}
  if (data.name !== undefined) updateFields.name = data.name
  if (data.code !== undefined) updateFields.code = data.code
  if (data.classId !== undefined) updateFields.classId = data.classId
  if (data.majorId !== undefined) updateFields.majorId = data.majorId
  if (data.credits !== undefined) updateFields.credits = data.credits
  if (data.description !== undefined) updateFields.description = data.description

  await db.update(subjects).set(updateFields).where(eq(subjects.id, id))
  return { success: true }
}

export async function deleteSubject(id: number) {
  await verifyPermission('subjects.manage')

  // Soft delete
  await db.update(subjects).set({ deletedAt: new Date() }).where(eq(subjects.id, id))
  return { success: true }
}