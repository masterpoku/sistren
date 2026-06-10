"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/layout/app-sidebar";
import { AppHeader } from "@/features/layout/header";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: number;
  roleLevel: number;
  image?: string;
}

interface AppLayoutClientProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppLayoutClient({
  user,
  onLogout,
  children,
}: AppLayoutClientProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar
          user={{ name: user.name, role: user.role, roleLevel: user.roleLevel }}
          onLogout={onLogout}
        />
        <SidebarInset className="flex flex-col">
          <AppHeader
            user={{
              name: user.name,
              email: user.email,
              role: user.role,
              roleLevel: user.roleLevel,
            }}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
