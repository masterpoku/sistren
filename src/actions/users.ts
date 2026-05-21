'use server'
'use node'

import { verifyPermission } from '@/lib/auth/verify-session'
import { getAllUsers } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq, isNull, and, count } from 'drizzle-orm'
import { hash } from 'argon2'

export async function fetchAllUsers() {
  await verifyPermission('users.read')
  return await getAllUsers()
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  roleId: number
}

export async function createUser(data: CreateUserData) {
  await verifyPermission('users.create')

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
    roleId: data.roleId,
  })

  // Get the newly created user
  const [newUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email))

  return { success: true, userId: Number(newUser?.id) }
}

export interface UpdateUserData {
  id: number
  name?: string
  email?: string
  roleId?: number
}

export async function updateUser(data: UpdateUserData) {
  await verifyPermission('users.update')

  // Security check: Prevent removing superadmin role from the last superadmin
  if (data.roleId !== undefined && data.roleId !== 1) {
    const [user] = await db
      .select({ roleId: users.roleId })
      .from(users)
      .where(and(eq(users.id, String(data.id)), isNull(users.deletedAt)))
    
    if (user?.roleId === 1) {
      const [{ count: superadminCount }] = await db
        .select({ count: count() })
        .from(users)
        .where(and(eq(users.roleId, 1), isNull(users.deletedAt)))
      if (superadminCount <= 1) {
        return { success: false, error: 'Cannot remove superadmin role from the last superadmin user' }
      }
    }
  }

  const updateFields: Record<string, unknown> = {}
  
  if (data.name !== undefined) updateFields.name = data.name
  if (data.email !== undefined) updateFields.email = data.email
  if (data.roleId !== undefined) updateFields.roleId = data.roleId

  await db.update(users).set(updateFields).where(eq(users.id, String(data.id)))

  return { success: true }
}

export async function deleteUser(id: number) {
  await verifyPermission('users.delete')
  
  // Security check: Prevent deleting the last superadmin user
  const [user] = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(and(eq(users.id, String(id)), isNull(users.deletedAt)))
  
  if (user?.roleId === 1) {
    const [{ count: superadminCount }] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.roleId, 1), isNull(users.deletedAt)))
    if (superadminCount <= 1) {
      return { success: false, error: 'Cannot delete the last superadmin user' }
    }
  }
  
  // Soft delete user and profile atomically
  await db.transaction(async (tx) => {
    // Soft delete profile
    await tx.update(profiles)
      .set({ deletedAt: new Date() })
      .where(eq(profiles.userId, id))
    
    // Soft delete user
    await tx.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, String(id)))
  })
  
  return { success: true }
}