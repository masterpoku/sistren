import { redirect } from 'next/navigation'
import { getSessionWithRole } from '@/lib/auth/get-session'
import { AppLayoutClient } from '@/features/layout/AppLayoutClient'
import { createAuthClient } from 'better-auth/client'

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
})

async function handleLogout() {
  'use server'
  await authClient.signOut()
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getSessionWithRole()

  if (!result) {
    redirect('/login')
  }

  const { user } = result

  return (
    <AppLayoutClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.roleName,
        roleId: user.roleId,
      }}
      onLogout={handleLogout}
    >
      {children}
    </AppLayoutClient>
  )
}