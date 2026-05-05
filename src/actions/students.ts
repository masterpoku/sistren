'use server'
'use node'

import { getStudents } from '@/lib/db/queries'

export async function fetchStudents() {
  return await getStudents()
}