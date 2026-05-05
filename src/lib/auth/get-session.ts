import 'server-only'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { users } from '@/lib/db/schema'

export interface SessionUser {
  id: string
  name: string
  email: string
  roleId: number
  roleName: string
  roleLevel: number
}

/**
 * Gets the current session with user role information from DB.
 * Returns null if not authenticated.
 */
export async function getSessionWithRole(): Promise<{ session: Awaited<ReturnType<typeof auth.api.getSession>>, user: SessionUser } | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  const baUser = session.user
  
  // Fetch user role from DB
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, parseInt(baUser.id)),
    with: { role: true },
  })

  if (!dbUser) {
    return null
  }

  return {
    session,
    user: {
      id: dbUser.id.toString(),
      name: dbUser.name || baUser.email,
      email: dbUser.email,
      roleId: dbUser.roleId as number,
      roleName: dbUser.role?.name || 'unknown',
      roleLevel: dbUser.role?.level || 0,
    },
  }
}

/**
 * Gets the current session (without DB role lookup).
 * Simpler but less detailed.
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  })
}