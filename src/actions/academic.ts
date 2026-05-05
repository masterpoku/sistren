'use server'
'use node'

import { getClasses, getMajors, getSemesters } from '@/lib/db/queries'

export async function fetchAcademic() {
  const [classes, majors, semesters] = await Promise.all([
    getClasses(),
    getMajors(),
    getSemesters(),
  ])
  return { classes, majors, semesters }
}