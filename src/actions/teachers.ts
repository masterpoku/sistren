'use server'
'use node'

import { getTeachers } from '@/lib/db/queries'

export async function fetchTeachers() {
  return await getTeachers()
}