'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getStudents, createProfile } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'
import { hash } from 'argon2'

export async function fetchStudents() {
  await verifyPermission('students.read')
  return await getStudents()
}

export async function fetchStudentById(id: number) {
  await verifyPermission('students.read')
  
  const { getUserById, getProfile } = await import('@/lib/db/queries')
  const [user, profile] = await Promise.all([
    getUserById(id),
    getProfile(id),
  ])
  
  if (!user) return null
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    ...(profile ? {
      nik: profile.nik,
      nisn: profile.nisn,
      birthPlace: profile.birthPlace,
      birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
      gender: profile.gender,
      address: profile.address,
      phone: profile.phone,
      fatherName: profile.fatherName,
      motherName: profile.motherName,
      parentsPhone: profile.parentsPhone,
      religion: profile.religion,
    } : {}),
  }
}

export interface CreateStudentData {
  email: string
  password: string
  name: string
  nik?: string
  nisn?: string
  birthPlace?: string
  birthDate?: string
  gender?: 'male' | 'female'
  address?: string
  phone?: string
  fatherName?: string
  motherName?: string
  parentsPhone?: string
  religion?: string
}

export async function createStudent(data: CreateStudentData) {
  await verifyPermission('students.create')

  // Check if active user with this email already exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, data.email), isNull(users.deletedAt)))
    .limit(1)
  
  if (existing.length > 0) {
    return { success: false, error: 'Email sudah terdaftar' }
  }

  const hashedPassword = await hash(data.password)

  // Insert user
  await db.insert(users).values({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    roleId: 4, // siswa
    confirmed: true,
  })

  // Get the newly created user
  const [newUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email))

  if (newUser) {
    // Create profile
    await createProfile({
      userId: newUser.id,
      name: data.name,
      nik: data.nik || null,
      nisn: data.nisn || null,
      birthPlace: data.birthPlace || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      gender: data.gender || null,
      address: data.address || null,
      phone: data.phone || null,
      fatherName: data.fatherName || null,
      motherName: data.motherName || null,
      parentsPhone: data.parentsPhone || null,
      religion: data.religion || null,
    })
  }

  return { success: true, userId: newUser?.id }
}

export interface UpdateStudentData {
  id: number
  name?: string
  nik?: string
  nisn?: string
  birthPlace?: string
  birthDate?: string
  gender?: 'male' | 'female'
  address?: string
  phone?: string
  fatherName?: string
  motherName?: string
  parentsPhone?: string
  religion?: string
}

export async function updateStudent(data: UpdateStudentData) {
  await verifyPermission('students.update')

  const { id, ...profileData } = data

  // Update user name
  if (profileData.name) {
    await db.update(users).set({ name: profileData.name }).where(eq(users.id, id))
  }

  // Update profile
  const { updateProfile } = await import('@/lib/db/queries')
  await updateProfile(id, {
    name: profileData.name,
    nik: profileData.nik,
    nisn: profileData.nisn,
    birthPlace: profileData.birthPlace,
    birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
    gender: profileData.gender,
    address: profileData.address,
    phone: profileData.phone,
    fatherName: profileData.fatherName,
    motherName: profileData.motherName,
    parentsPhone: profileData.parentsPhone,
    religion: profileData.religion,
  })

  return { success: true }
}

export async function deleteStudent(id: number) {
  await verifyPermission('students.delete')
  
  // Soft delete user and profile atomically
  await db.transaction(async (tx) => {
    // Soft delete profile
    await tx.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id))
    
    // Soft delete profile (from queries.ts, uses same pattern)
    const { profiles } = await import('@/lib/db/schema')
    await tx.update(profiles)
      .set({ deletedAt: new Date() })
      .where(eq(profiles.userId, id))
  })
  
  return { success: true }
}