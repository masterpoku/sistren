'use server'
'use node'

import { verifyAdmin } from '@/lib/auth/verify-session'
import { getAllUsers } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'argon2'

export async function fetchAllUsers() {
  await verifyAdmin()
  return await getAllUsers()
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  roleId: number
}

export async function createUser(data: CreateUserData) {
  await verifyAdmin()

  const hashedPassword = await hash(data.password)

  // Insert user
  await db.insert(users).values({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    roleId: data.roleId,
    confirmed: true,
  })

  // Get the newly created user
  const [newUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email))

  return { success: true, userId: newUser?.id }
}

export interface UpdateUserData {
  id: number
  name?: string
  email?: string
  roleId?: number
}

export async function updateUser(data: UpdateUserData) {
  await verifyAdmin()

  const updateFields: Record<string, unknown> = {}
  
  if (data.name !== undefined) updateFields.name = data.name
  if (data.email !== undefined) updateFields.email = data.email
  if (data.roleId !== undefined) updateFields.roleId = data.roleId

  await db.update(users).set(updateFields).where(eq(users.id, data.id))

  return { success: true }
}

export async function deleteUser(id: number) {
  await verifyAdmin()
  
  // Delete profile first
  const { deleteProfile } = await import('@/lib/db/queries')
  await deleteProfile(id)
  
  // Delete user
  await db.delete(users).where(eq(users.id, id))
  
  return { success: true }
}