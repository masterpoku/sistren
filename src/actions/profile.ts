'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getUserById, getProfile, updateProfile } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function fetchUserProfile() {
  const session = await verifySession()
  const [user, profile] = await Promise.all([
    getUserById(session.userId),
    getProfile(session.userId),
  ])
  return { user, profile }
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  nik?: string
  birthPlace?: string
  birthDate?: string
  address?: string
  religion?: string
  gender?: 'male' | 'female'
}

export async function updateUserProfile(data: UpdateProfileData) {
  const session = await verifySession()
  const userId = session.userId

  // Update user name if provided
  if (data.name) {
    await db.update(users).set({ name: data.name }).where(eq(users.id, String(userId)))
  }

  // Update profile fields
  await updateProfile(userId, {
    nik: data.nik,
    phone: data.phone,
    birthPlace: data.birthPlace,
    birthDate: data.birthDate ? new Date(data.birthDate) : null,
    address: data.address,
    religion: data.religion,
    gender: data.gender,
  })

  return { success: true }
}