'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAuthClient } from 'better-auth/client'
import { AppLayout } from '@/features/layout/AppLayout'
import type { UserRole } from '@/util/mock/users'

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
})

interface SessionUser {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  roleId: number
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSession() {
      try {
        const session = await authClient.getSession()
        if (session?.data?.user) {
          const baUser = session.data.user
          setUser({
            id: baUser.id,
            name: baUser.name || baUser.email,
            email: baUser.email,
            avatar: baUser.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(baUser.email)}`,
            role: 'siswa' as UserRole,
            roleId: 4,
          })
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    const unsubscribe = authClient.$store.listen('$sessionSignal', async (isLoggedIn) => {
      if (!isLoggedIn) {
        router.push('/login')
      }
    })

    return unsubscribe
  }, [router])

  const handleLogout = async () => {
    try {
      await authClient.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      {children}
    </AppLayout>
  )
}