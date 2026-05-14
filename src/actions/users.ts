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

  // Security check: Prevent removing superadmin role from the last superadmin
  if (data.roleId !== undefined && data.roleId !== 1) {
    // Check if this user is a superadmin
    const [user] = await db.select({ roleId: users.roleId }).from(users).where(eq(users.id, data.id))
    
    if (user?.roleId === 1) {
      // Count remaining superadmin users
      const result = await db.execute('SELECT COUNT(*) as cnt FROM users WHERE role_id = 1')
      const superadminCount = (result as any)[0]?.[0]?.cnt || 0
      
      if (superadminCount <= 1) {
        return { success: false, error: 'Cannot remove superadmin role from the last superadmin user' }
      }
    }
  }

  const updateFields: Record<string, unknown> = {}
  
  if (data.name !== undefined) updateFields.name = data.name
  if (data.email !== undefined) updateFields.email = data.email
  if (data.roleId !== undefined) updateFields.roleId = data.roleId

  await db.update(users).set(updateFields).where(eq(users.id, data.id))

  return { success: true }
}

export async function deleteUser(id: number) {
  await verifyAdmin()
  
  // Security check: Prevent deleting the last superadmin user
  const [user] = await db.select({ roleId: users.roleId }).from(users).where(eq(users.id, id))
  
  if (user?.roleId === 1) {
    const result = await db.execute('SELECT COUNT(*) as cnt FROM users WHERE role_id = 1')
    const superadminCount = (result as any)[0]?.[0]?.cnt || 0
    
    if (superadminCount <= 1) {
      return { success: false, error: 'Cannot delete the last superadmin user' }
    }
  }
  
  // Delete profile first
  const { deleteProfile } = await import('@/lib/db/queries')
  await deleteProfile(id)
  
  // Delete user
  await db.delete(users).where(eq(users.id, id))
  
  return { success: true }
}