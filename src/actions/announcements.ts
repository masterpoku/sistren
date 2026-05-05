'use server'
'use node'

import { getAnnouncements } from '@/lib/db/queries'

export async function fetchAnnouncements() {
  return await getAnnouncements()
}