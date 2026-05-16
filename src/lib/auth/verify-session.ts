import 'server-only'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Verifies the user session from the request.
 * Redirects to /login if no valid session.
 */
export async function verifySession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  return {
    userId: parseInt(session.user.id),
    email: session.user.email,
    name: session.user.name,
  }
}

/**
 * Verifies the user has admin-level permissions (roleLevel >= 80).
 * Redirects to /unauthorized if not authorized.
 */
export async function verifyAdmin() {
  const { userId } = await verifySession()
  
  // Import here to avoid circular dependencies
  const { hasRoleLevel } = await import('@/lib/auth/permissions')
  
  const allowed = await hasRoleLevel(userId, 80)
  if (!allowed) {
    redirect('/unauthorized')
  }
  
  return userId
}

/**
 * Verifies the user has minimum role level.
 * Redirects to /unauthorized if not authorized.
 */
export async function verifyRoleLevel(minLevel: number) {
  const { userId } = await verifySession()
  
  const { hasRoleLevel } = await import('@/lib/auth/permissions')
  
  const allowed = await hasRoleLevel(userId, minLevel)
  if (!allowed) {
    redirect('/unauthorized')
  }
  
  return userId
}

/**
 * Verifies the user has a specific permission.
 * Superadmin (level >= 100) bypass — handled by hasPermission().
 * Redirects to /unauthorized if not authorized.
 */
export async function verifyPermission(permissionName: string) {
  const { userId } = await verifySession()
  
  const { hasPermission } = await import('@/lib/auth/permissions')
  
  const allowed = await hasPermission(userId, permissionName)
  if (!allowed) {
    redirect('/unauthorized')
  }
  
  return userId
}