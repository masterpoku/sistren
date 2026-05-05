'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getAllUsers } from '@/lib/db/queries'

export async function fetchAllUsers() {
  await verifySession()
  return await getAllUsers()
}