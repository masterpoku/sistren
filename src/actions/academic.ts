'use server'
'use node'

import { verifySession } from '@/lib/auth/verify-session'
import { getClasses, getMajors, getSemesters } from '@/lib/db/queries'

export async function fetchAcademic() {
  await verifySession()
  const [classes, majors, semesters] = await Promise.all([
    getClasses(),
    getMajors(),
    getSemesters(),
  ])
  return { classes, majors, semesters }
}