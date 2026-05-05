'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getAnnouncements } from '@/lib/db/queries'

export async function fetchAnnouncements() {
  await verifySession()
  return await getAnnouncements()
}