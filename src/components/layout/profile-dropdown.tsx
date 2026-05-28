'use client'

import { SignOut } from 'phosphor-react'

interface ProfileDropdownProps {
  user: {
    name: string
    role: string
  }
  onLogout: () => void
}

export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 border-t p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <span className="text-sm font-medium">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {user.role}
          </p>
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
  )
}