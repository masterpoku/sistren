'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getPayments } from '@/lib/db/queries'

export async function fetchPayments(userId?: number, roleId?: number) {
  await verifySession()
  return await getPayments(userId, roleId)
}