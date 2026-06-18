"use client";

import { SignOut } from "@phosphor-icons/react";

interface ProfileDropdownProps {
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
}

export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  return (
    <div className="mt-auto w-full border-t border-sidebar-border p-2 group-data-[collapsible=icon]:p-2">
      <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
          <span className="text-sm font-medium group-data-[collapsible=icon]:text-xs">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground capitalize">
            {user.role}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-slate-100 group-data-[collapsible=icon]:hidden"
          title="Logout"
        >
          <SignOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
