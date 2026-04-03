import {
  House,
  GraduationCap,
  Wallet,
  User,
  Bell,
  Gear,
  SignOut,
  Student,
  Users,
  UserCircle,
} from '@phosphor-icons/react';

export const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: House },
  { title: 'Akademik', href: '/academic', icon: GraduationCap },
  { title: 'Keuangan', href: '/finance', icon: Wallet },
  { title: 'Siswa', href: '/students', icon: Student },
  { title: 'Guru', href: '/teachers', icon: Users },
  { title: 'Pengguna', href: '/users', icon: UserCircle },
  { title: 'Pengumuman', href: '/announcements', icon: Bell },
  { title: 'Profil', href: '/profile', icon: User },
];

export const USER_MENU_ITEMS = [
  { title: 'Profil', href: '/profile', icon: User },
  { title: 'Pengaturan', href: '/settings', icon: Gear },
  { divider: true },
  { title: 'Keluar', href: '/logout', icon: SignOut, destructive: true },
];
