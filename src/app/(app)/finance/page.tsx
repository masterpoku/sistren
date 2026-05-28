import { verifyRoleLevel } from '@/lib/auth/verify-session'
import { redirect } from 'next/navigation'

export default async function FinancePage() {
  await verifyRoleLevel(80)
  redirect('/payments')
}