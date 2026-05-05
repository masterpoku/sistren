import { getUserPermissions } from '@/lib/auth/permissions'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  if (!userId) {
    return Response.json({ error: 'userId required' }, { status: 400 })
  }

  const ctx = await getUserPermissions(parseInt(userId, 10))

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