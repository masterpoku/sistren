'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getDashboardStats } from '@/lib/db/queries'

export async function fetchDashboardStats() {
  await verifySession()
  return await getDashboardStats()
}

export async function getCurrentUserRole() {
  const session = await verifySession()
  
  // Fetch user with role from DB
  const { getUserWithRole } = await import('@/lib/db/queries-user')
  const dbUser = await getUserWithRole(session.userId)
  
  if (!dbUser) {
    return null
  }
  
  return {
    id: dbUser.id.toString(),
    name: dbUser.name || session.email,
    email: dbUser.email,
    roleName: dbUser.role?.name || 'unknown',
    roleId: dbUser.roleId as number,
    roleLevel: dbUser.role?.level || 0,
  }
}