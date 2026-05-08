import 'server-only'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getUserWithRole } from '@/lib/db/queries-user'

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
  const userId = parseInt(baUser.id)

  // Use MariaDB-compatible query
  const dbUser = await getUserWithRole(userId)

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