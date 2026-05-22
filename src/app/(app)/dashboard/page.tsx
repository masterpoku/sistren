import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Selamat datang, {session.user.name}
      </p>
      {/* Full dashboard implementation in Phase 11 */}
    </div>
  )
}