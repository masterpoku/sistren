'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  House,
  GraduationCap,
  Wallet,
  Student,
  Users,
  UserCircle,
  Bell,
  SignOut,
  List,
  X,
} from 'phosphor-react'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  minLevel?: number // Minimum role level to see this item
}

// Role levels: superadmin=100, administrator=80, headmaster=70, teacher=60, student=40, parent=30, alumni=20
const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: House },
  { title: 'Akademik', href: '/academic', icon: GraduationCap, minLevel: 40 },
  { title: 'Keuangan', href: '/finance', icon: Wallet, minLevel: 80 },
  { title: 'Siswa', href: '/students', icon: Student, minLevel: 60 },
  { title: 'Guru', href: '/teachers', icon: Users, minLevel: 60 },
  { title: 'Pengguna', href: '/users', icon: UserCircle, minLevel: 80 },
  { title: 'Pengumuman', href: '/announcements', icon: Bell },
]

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
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">SISTREN</h1>
              <p className="text-xs text-muted-foreground">SMK TERPADU</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navItems
            .filter((item) => !item.minLevel || user.roleLevel >= item.minLevel)
            .map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <span className="text-sm font-medium">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-2 text-muted-foreground hover:bg-slate-100"
              title="Logout"
            >
              <SignOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <List className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold">SISTREN</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}