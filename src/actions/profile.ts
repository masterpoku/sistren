'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getUserById, getProfile } from '@/lib/db/queries'

export async function fetchUserProfile() {
  const session = await verifySession()
  const [user, profile] = await Promise.all([
    getUserById(session.userId),
    getProfile(session.userId),
  ])
  return { user, profile }
}