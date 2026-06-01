'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  GraduationCap,
  Wallet,
  Student,
  Users,
  UserCircle,
  Bell,
  Shield,
  Gear,
  Scroll,
} from '@phosphor-icons/react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ProfileDropdown } from './profile-dropdown';
import { cn } from '@/lib/utils';

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
  {
    title: 'Transkrip',
    href: '/alumni/transcript',
    icon: Scroll,
    minLevel: 20,
    maxLevel: 40,
  },
  { title: 'Roles', href: '/roles', icon: Shield, minLevel: 100 },
  { title: 'Permissions', href: '/permissions', icon: Gear, minLevel: 100 },
];

interface AppSidebarProps {
  user: {
    name: string;
    role: string;
    roleLevel: number;
  };
  onLogout: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const isAlumni = user.roleLevel === 20;

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        'border-r border-sidebar-border transition-colors duration-300',
        isAlumni && 'alumni-sidebar'
      )}
    >
      <SidebarHeader className="group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 px-2">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm',
              isAlumni
                ? 'bg-yellow-600 text-white'
                : 'bg-sidebar-primary text-sidebar-primary-foreground'
            )}
          >
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-none">SISTREN</span>
            <span
              className={cn(
                'text-[10px]',
                isAlumni ? 'text-yellow-900/70' : 'text-sidebar-foreground/70'
              )}
            >
              SMK TERPADU
            </span>
          </div>
        </div>
        {isAlumni && (
          <div className="mt-2 px-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5 rounded-md bg-yellow-500/30 px-2 py-1 text-[10px] font-bold text-yellow-900 border border-yellow-600/20">
              <Scroll className="h-3 w-3" />
              PORTAL ALUMNI
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              'font-semibold',
              isAlumni ? 'text-yellow-900/60' : 'text-sidebar-foreground/50'
            )}
          >
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => {
                  if (
                    item.minLevel !== undefined &&
                    user.roleLevel < item.minLevel
                  )
                    return false;
                  if (
                    item.maxLevel !== undefined &&
                    user.roleLevel > item.maxLevel
                  )
                    return false;
                  return true;
                })
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          'transition-colors',
                          isAlumni
                            ? 'hover:bg-yellow-500/40 data-[active=true]:bg-yellow-600/30 data-[active=true]:text-yellow-950'
                            : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground'
                        )}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ProfileDropdown user={user} onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
