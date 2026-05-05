'use server'
'use node'

import { getDashboardStats } from '@/lib/db/queries'

export async function fetchDashboardStats() {
  return await getDashboardStats()
}