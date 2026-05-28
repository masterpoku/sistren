import { verifyRoleLevel } from '@/lib/auth/verify-session'
import { redirect } from 'next/navigation'

export default async function PermissionsPage() {
  await verifyRoleLevel(100)
  redirect('/admin/users')
}