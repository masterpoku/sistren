'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getTeachers } from '@/lib/db/queries'

export async function fetchTeachers() {
  await verifySession()
  return await getTeachers()
}