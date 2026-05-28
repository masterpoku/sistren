import { verifyRoleLevel } from '@/lib/auth/verify-session'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  await verifyRoleLevel(80)
  redirect('/admin/users')
}