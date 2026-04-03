'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { User } from '@/util/mock/users';
import { AppSidebar } from './AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  List,
  MagnifyingGlass,
  Bell,
  CaretLeft,
  CaretRight,
} from 'phosphor-react';

function getPageTitle(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return 'Dashboard';
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
}

interface AppLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppLayout({ user, onLogout, children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const currentPage = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen w-full bg-slate-50/50">
      {/* Sidebar - hidden on mobile, fixed on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 hidden md:block ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <AppSidebar
          user={user}
          onLogout={onLogout}
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar - slides from left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AppSidebar
          user={user}
          onLogout={onLogout}
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {/* Main Content with SidebarInset */}
      <SidebarInset
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
          {/* Left: Mobile menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen(true)}
            >
              <List className="h-5 w-5" />
            </Button>

            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-9 w-9"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <CaretRight className="h-5 w-5" />
              ) : (
                <CaretLeft className="h-5 w-5" />
              )}
            </Button>

            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">SISTREN</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">
                    {currentPage}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Search, Notifications, User Menu */}
          <div className="flex items-center gap-4">
            {/* Search - large screens */}
            <div className="relative hidden md:block">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari menu..."
                className="w-[300px] pl-8 bg-muted/50 border-0 h-9 focus-visible:ring-primary/20"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
            </Button>

            {/* Divider */}
            <div className="h-8 w-px bg-border mx-1" />

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end md:flex">
                <span className="text-xs font-semibold leading-none">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {user.studentId || user.employeeId}
                </span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary/10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </div>
  );
}
