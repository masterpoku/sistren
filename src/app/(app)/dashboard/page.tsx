import { verifySession } from '@/lib/auth/verify-session'

export default async function DashboardPage() {
  const session = await verifySession()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Selamat datang, {session.name}
      </p>
    </div>
  )
}