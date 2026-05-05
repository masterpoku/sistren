'use server'
'use node'

import { getPayments } from '@/lib/db/queries'

export async function fetchPayments(userId?: number, roleId?: number) {
  return await getPayments(userId, roleId)
}