'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  House,
  GraduationCap,
  Wallet,
  Student,
  Users,
  UserCircle,
  Bell,
  List,
  X,
  Shield,
  Gear,
  Scroll,
} from 'phosphor-react';
import { ProfileDropdown } from './profile-dropdown';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  minLevel?: number;
  maxLevel?: number;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: House },
  { title: 'Akademik', href: '/academic', icon: GraduationCap, minLevel: 40 },
  { title: 'Keuangan', href: '/finance', icon: Wallet, minLevel: 80 },
  { title: 'Siswa', href: '/students', icon: Student, minLevel: 60 },
  { title: 'Guru', href: '/teachers', icon: Users, minLevel: 60 },
  { title: 'Pengguna', href: '/users', icon: UserCircle, minLevel: 80 },
  { title: 'Pengumuman', href: '/announcements', icon: Bell },
  { title: 'Transkrip', href: '/alumni/transcript', icon: Scroll, minLevel: 20, maxLevel: 40 },
  { title: 'Roles', href: '/roles', icon: Shield, minLevel: 100 },
  { title: 'Permissions', href: '/permissions', icon: Gear, minLevel: 100 },
];

interface SidebarProps {
  user: {
    name: string;
    role: string;
    roleLevel: number;
  };
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
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
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navItems
            .filter((item) => {
              if (item.minLevel !== undefined && user.roleLevel < item.minLevel) return false;
              if (item.maxLevel !== undefined && user.roleLevel > item.maxLevel) return false;
              return true;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
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
              );
            })}
        </nav>

        <ProfileDropdown user={user} onLogout={onLogout} />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg lg:hidden"
      >
        <List className="h-6 w-6" />
      </button>
    </>
  );
}
