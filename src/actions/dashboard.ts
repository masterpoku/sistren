'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getDashboardStats } from '@/lib/db/queries'

export async function fetchDashboardStats() {
  await verifySession()
  return await getDashboardStats()
}