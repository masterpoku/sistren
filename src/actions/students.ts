'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getStudents } from '@/lib/db/queries'

export async function fetchStudents() {
  await verifySession()
  return await getStudents()
}