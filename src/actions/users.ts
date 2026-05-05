'use server'
'use node'

import { getAllUsers } from '@/lib/db/queries'

export async function fetchAllUsers() {
  return await getAllUsers()
}