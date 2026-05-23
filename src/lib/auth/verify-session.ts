import 'server-only'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthContext } from './permissions'

/**
 * Gets the user session if one exists, or null if none.
 * Does NOT redirect — use this when you just want to check session state.
 * Includes soft-delete check: returns null if user is deactivated.
 */
export async function getOptionalSession(): Promise<{ userId: string; email: string; name: string } | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  }
}

/**
 * Verifies the user session from the request.
 * Redirects to /login if no valid session.
 * Returns userId as string (UUID from better-auth).
 */
export async function verifySession(): Promise<{ userId: string; email: string; name: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  }
}

/**
 * Verifies the user has admin-level permissions (roleLevel >= 80).
 * Redirects to /unauthorized if not authorized.
 */
export async function verifyAdmin(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  const ctx = await getAuthContext(session.user.id)
  if (!ctx || ctx.roleLevel < 80) {
    redirect('/unauthorized')
  }

  return session.user.id
}

/**
 * Verifies the user has minimum role level.
 * Redirects to /unauthorized if not authorized.
 */
export async function verifyRoleLevel(minLevel: number): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  const ctx = await getAuthContext(session.user.id)
  if (!ctx || ctx.roleLevel < minLevel) {
    redirect('/unauthorized')
  }

  return session.user.id
}

/**
 * Verifies the user has a specific permission.
 * Superadmin (level >= 100) bypass — handled by getAuthContext().
 * Redirects to /unauthorized if not authorized.
 */
export async function verifyPermission(permissionName: string): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  const ctx = await getAuthContext(session.user.id)
  if (!ctx || !ctx.permissions.has(permissionName)) {
    redirect('/unauthorized')
  }

  return session.user.id
}