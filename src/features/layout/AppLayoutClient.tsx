'use client'

import { GraduationCap } from 'phosphor-react'
import { Sidebar } from '@/components/layout/sidebar'

interface User {
  id: string
  name: string
  email: string
  role: string
  roleId: number
  roleLevel: number
}

interface AppLayoutClientProps {
  user: User
  onLogout: () => void
  children: React.ReactNode
}

export function AppLayoutClient({ user, onLogout, children }: AppLayoutClientProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={{ name: user.name, role: user.role, roleLevel: user.roleLevel }}
        onLogout={onLogout}
      />

      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Header */}
        <header className="flex h-16 items-center gap-3 border-b bg-white px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold">SISTREN</span>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}