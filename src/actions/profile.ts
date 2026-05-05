'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getUserById } from '@/lib/db/queries'

export async function fetchUserProfile() {
  const session = await verifySession()
  return await getUserById(session.userId)
}