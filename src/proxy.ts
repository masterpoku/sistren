import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { PUBLIC_ROUTES, ROUTE_PERMISSIONS, ROLE_LEVEL_REQUIREMENTS } from '@/lib/auth/route-permissions'
import { hasPermission, hasRoleLevel } from '@/lib/auth/permissions'
import { eq } from 'drizzle-orm'

// Pre-sort routes by length (longest first) so more specific paths match first
const SORTED_ROUTE_ENTRIES = Object.entries(ROUTE_PERMISSIONS).sort(
  ([a], [b]) => b.length - a.length
)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Soft-delete check — redirect to /login if user was deactivated
  const [userRecord] = await db
    .select({ deletedAt: users.deletedAt })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (userRecord && userRecord.deletedAt !== null) {
    await auth.api.signOut({ headers: request.headers })
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const minLevel = ROLE_LEVEL_REQUIREMENTS[pathname]
  if (minLevel !== undefined) {
    const hasLevel = await hasRoleLevel(session.user.id, minLevel)
    if (!hasLevel) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  const requiredPermission = SORTED_ROUTE_ENTRIES.find(([route]) =>
    pathname.startsWith(route)
  )?.[1]

  if (requiredPermission) {
    const allowed = await hasPermission(session.user.id, requiredPermission)
    if (!allowed) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|better-auth|css|images|fonts|js).*)',
  ],
}