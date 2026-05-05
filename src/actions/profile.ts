'use server'
'use node'

import { getUserById } from '@/lib/db/queries'

export async function fetchUserProfile(userId: number) {
  return await getUserById(userId)
}