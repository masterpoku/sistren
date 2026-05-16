import { auth } from '@/lib/auth'
import { getUserPermissions } from '@/lib/auth/permissions'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Derive userId from session cookie — secure, no query param needed
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ctx = await getUserPermissions(parseInt(session.user.id, 10))

  if (!ctx) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  return Response.json({
    permissions: Array.from(ctx.permissions),
    roleLevel: ctx.roleLevel,
    roleName: ctx.roleName,
    roleId: ctx.roleId,
  })
}