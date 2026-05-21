'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getTeachers, createProfile } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'
import { hash } from 'argon2'

export async function fetchTeachers() {
  await verifyPermission('teachers.read')
  return await getTeachers()
}

export async function fetchTeacherById(id: number) {
  await verifyPermission('teachers.read')
  
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
      phone: profile.phone,
      birthPlace: profile.birthPlace,
      birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
      address: profile.address,
    } : {}),
  }
}

export interface CreateTeacherData {
  email: string
  password: string
  name: string
  nik?: string
  phone?: string
  birthPlace?: string
  birthDate?: string
  address?: string
}

export async function createTeacher(data: CreateTeacherData) {
  await verifyPermission('teachers.create')

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
    roleId: 3, // guru
  })

  // Get the newly created user
  const [newUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email))

  if (newUser) {
    await createProfile({
      userId: Number(newUser.id),
      nik: data.nik || null,
      birthPlace: data.birthPlace || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      address: data.address || null,
      phone: data.phone || null,
    })
  }

  return { success: true, userId: newUser?.id }
}

export interface UpdateTeacherData {
  id: number
  name?: string
  nik?: string
  phone?: string
  birthPlace?: string
  birthDate?: string
  address?: string
}

export async function updateTeacher(data: UpdateTeacherData) {
  await verifyPermission('teachers.update')

  const { id, ...profileData } = data

  if (profileData.name) {
    await db.update(users).set({ name: profileData.name }).where(eq(users.id, String(id)))
  }

  const { updateProfile } = await import('@/lib/db/queries')
  await updateProfile(id, {
    nik: profileData.nik,
    birthPlace: profileData.birthPlace,
    birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
    address: profileData.address,
    phone: profileData.phone,
  })

  return { success: true }
}

export async function deleteTeacher(id: number) {
  await verifyPermission('teachers.delete')
  
  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, String(id)))
    
    await tx.update(profiles)
      .set({ deletedAt: new Date() })
      .where(eq(profiles.userId, id))
  })
  
  return { success: true }
}