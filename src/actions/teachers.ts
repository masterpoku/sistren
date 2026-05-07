'use server'
'use node'

import { verifyAdmin } from '@/lib/auth/verify-session'
import { getTeachers, createProfile } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'argon2'

export async function fetchTeachers() {
  await verifyAdmin()
  return await getTeachers()
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
  await verifyAdmin()

  const hashedPassword = await hash(data.password)

  // Insert user
  await db.insert(users).values({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    roleId: 3, // guru
    confirmed: true,
  })

  // Get the newly created user
  const [newUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email))

  if (newUser) {
    await createProfile({
      userId: newUser.id,
      name: data.name,
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
  await verifyAdmin()

  const { id, ...profileData } = data

  if (profileData.name) {
    await db.update(users).set({ name: profileData.name }).where(eq(users.id, id))
  }

  const { updateProfile } = await import('@/lib/db/queries')
  await updateProfile(id, {
    name: profileData.name,
    nik: profileData.nik,
    birthPlace: profileData.birthPlace,
    birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
    address: profileData.address,
    phone: profileData.phone,
  })

  return { success: true }
}

export async function deleteTeacher(id: number) {
  await verifyAdmin()
  
  const { deleteProfile } = await import('@/lib/db/queries')
  await deleteProfile(id)
  await db.delete(users).where(eq(users.id, id))
  
  return { success: true }
}