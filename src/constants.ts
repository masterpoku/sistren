import {
  House,
  GraduationCap,
  Wallet,
  User,
  Bell,
  CalendarCheck,
  Student,
  Users,
  UserCircle,
  Gear,
  SignOut,
} from '@phosphor-icons/react'

import type { Announcement } from '@/util/mock/announcements'

// ============ Navigation ============

export const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: House },
  { title: 'Akademik', href: '/academic', icon: GraduationCap },
  { title: 'Keuangan', href: '/finance', icon: Wallet },
  { title: 'Presensi', href: '/attendance', icon: CalendarCheck },
  { title: 'Siswa', href: '/students', icon: Student },
  { title: 'Guru', href: '/teachers', icon: Users },
  { title: 'Pengguna', href: '/users', icon: UserCircle },
  { title: 'Pengumuman', href: '/announcements', icon: Bell },
  { title: 'Profil', href: '/profile', icon: User },
]

export const USER_MENU_ITEMS = [
  { title: 'Profil', href: '/profile', icon: User },
  { title: 'Pengaturan', href: '/settings', icon: Gear },
  { divider: true },
  { title: 'Keluar', href: '/logout', icon: SignOut, destructive: true },
]

// ============ Types ============

export type UserRole = 'superadmin' | 'administrator' | 'guru' | 'siswa' | 'alumni'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  studentId?: string
  employeeId?: string
  faculty?: string
  major?: string
  graduationYear?: string
}

export interface Student {
  id: string
  name: string
  studentId: string
  class: string
  email: string
  status: 'aktif' | 'non-aktif' | 'lulus'
  joinDate: string
}

export interface Teacher {
  id: string
  name: string
  employeeId: string
  subject: string
  email: string
  status: 'aktif' | 'cuti' | 'pensiun'
}

export interface Payment {
  id: string
  studentName: string
  studentId: string
  amount: number
  type: 'SPP' | 'Uang Gedung' | 'Seragam' | 'Lainnya'
  status: 'lunas' | 'belum-lunas' | 'menunggu-konfirmasi'
  date: string
}

export interface UserManagement {
  id: string
  name: string
  email: string
  role: UserRole
  lastLogin: string
}

export interface AcademicRecord {
  semester: string
  gpa: number
  credits: number
}

export interface Course {
  id: string
  name: string
  credits: number
  grade: string
  semester: string
}

// ============ Mock Data ============

export const MOCK_ACCOUNTS: Record<string, User> = {
  'superadmin@sistren.sch.id': {
    id: 'SA001',
    name: 'Super Admin',
    email: 'superadmin@sistren.sch.id',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin',
    role: 'superadmin',
    employeeId: 'SA-001',
  },
  'admin@sistren.sch.id': {
    id: 'ADM001',
    name: 'Administrator TU',
    email: 'admin@sistren.sch.id',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'administrator',
    employeeId: 'ADM-001',
  },
  'guru@sistren.sch.id': {
    id: 'GRU001',
    name: 'Bapak Guru',
    email: 'guru@sistren.sch.id',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guru',
    role: 'guru',
    employeeId: '198501012010011001',
    faculty: 'Teknik Komputer & Jaringan',
  },
  'siswa@sistren.sch.id': {
    id: 'SSW001',
    name: 'Budi Santoso',
    email: 'siswa@sistren.sch.id',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    role: 'siswa',
    studentId: '2026/10293/TKJ',
    faculty: 'Teknik Komputer & Jaringan',
    major: 'SMK TERPADU',
  },
  'alumni@sistren.sch.id': {
    id: 'ALM001',
    name: 'Andi Alumni',
    email: 'alumni@sistren.sch.id',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi',
    role: 'alumni',
    studentId: '2022/09123/TKJ',
    graduationYear: '2024',
  },
}

export const MOCK_USER = MOCK_ACCOUNTS['siswa@sistren.sch.id']

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Ahmad Fauzi',
    studentId: '2024001',
    class: 'X-TKJ-1',
    email: 'ahmad@siswa.id',
    status: 'aktif',
    joinDate: '2024-07-15',
  },
  {
    id: '2',
    name: 'Budi Santoso',
    studentId: '2024002',
    class: 'X-RPL-2',
    email: 'budi@siswa.id',
    status: 'aktif',
    joinDate: '2024-07-15',
  },
  {
    id: '3',
    name: 'Citra Lestari',
    studentId: '2024003',
    class: 'XI-TKJ-1',
    email: 'citra@siswa.id',
    status: 'aktif',
    joinDate: '2023-07-15',
  },
  {
    id: '4',
    name: 'Dedi Kurniawan',
    studentId: '2024004',
    class: 'XII-RPL-1',
    email: 'dedi@siswa.id',
    status: 'aktif',
    joinDate: '2022-07-15',
  },
  {
    id: '5',
    name: 'Eka Putri',
    studentId: '2024005',
    class: 'X-TKJ-2',
    email: 'eka@siswa.id',
    status: 'non-aktif',
    joinDate: '2024-07-15',
  },
  {
    id: '6',
    name: 'Fajar Ramadhan',
    studentId: '2024006',
    class: 'XI-RPL-1',
    email: 'fajar@siswa.id',
    status: 'aktif',
    joinDate: '2023-07-15',
  },
  {
    id: '7',
    name: 'Gita Permata',
    studentId: '2024007',
    class: 'XII-TKJ-2',
    email: 'gita@siswa.id',
    status: 'lulus',
    joinDate: '2021-07-15',
  },
  {
    id: '8',
    name: 'Hadi Wijaya',
    studentId: '2024008',
    class: 'X-RPL-1',
    email: 'hadi@siswa.id',
    status: 'aktif',
    joinDate: '2024-07-15',
  },
  {
    id: '9',
    name: 'Indah Sari',
    studentId: '2024009',
    class: 'XI-TKJ-2',
    email: 'indah@siswa.id',
    status: 'aktif',
    joinDate: '2023-07-15',
  },
  {
    id: '10',
    name: 'Joko Susilo',
    studentId: '2024010',
    class: 'XII-RPL-2',
    email: 'joko@siswa.id',
    status: 'aktif',
    joinDate: '2022-07-15',
  },
]

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: '1',
    name: 'Bapak Guru',
    employeeId: '198501012010011001',
    subject: 'Teknik Komputer & Jaringan',
    email: 'guru@sistren.sch.id',
    status: 'aktif',
  },
  {
    id: '2',
    name: 'Ibu Siti Aminah',
    employeeId: '198802022012022002',
    subject: 'Matematika',
    email: 'siti@sistren.sch.id',
    status: 'aktif',
  },
  {
    id: '3',
    name: 'Bapak Ahmad',
    employeeId: '198203032008011003',
    subject: 'Bahasa Indonesia',
    email: 'ahmad@sistren.sch.id',
    status: 'aktif',
  },
  {
    id: '4',
    name: 'Ibu Maria',
    employeeId: '199004042015022004',
    subject: 'Bahasa Inggris',
    email: 'maria@sistren.sch.id',
    status: 'aktif',
  },
  {
    id: '5',
    name: 'Bapak Yusuf',
    employeeId: '198005052005011005',
    subject: 'Fisika',
    email: 'yusuf@sistren.sch.id',
    status: 'cuti',
  },
]

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    studentName: 'Ahmad Fauzi',
    studentId: '2024001',
    amount: 500000,
    type: 'SPP',
    status: 'lunas',
    date: '2024-04-01',
  },
  {
    id: '2',
    studentName: 'Budi Santoso',
    studentId: '2024002',
    amount: 500000,
    type: 'SPP',
    status: 'belum-lunas',
    date: '2024-04-01',
  },
  {
    id: '3',
    studentName: 'Citra Lestari',
    studentId: '2024003',
    amount: 1500000,
    type: 'Uang Gedung',
    status: 'lunas',
    date: '2024-03-15',
  },
  {
    id: '4',
    studentName: 'Dedi Kurniawan',
    studentId: '2024004',
    amount: 750000,
    type: 'Seragam',
    status: 'menunggu-konfirmasi',
    date: '2024-03-20',
  },
  {
    id: '5',
    studentName: 'Eka Putri',
    studentId: '2024005',
    amount: 500000,
    type: 'SPP',
    status: 'lunas',
    date: '2024-04-02',
  },
]

export const MOCK_USERS_LIST: UserManagement[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@sistren.sch.id',
    role: 'superadmin',
    lastLogin: '2024-04-02 08:30',
  },
  {
    id: '2',
    name: 'Administrator TU',
    email: 'admin@sistren.sch.id',
    role: 'administrator',
    lastLogin: '2024-04-02 09:15',
  },
  {
    id: '3',
    name: 'Bapak Guru',
    email: 'guru@sistren.sch.id',
    role: 'guru',
    lastLogin: '2024-04-01 14:20',
  },
  {
    id: '4',
    name: 'Budi Santoso',
    email: 'siswa@sistren.sch.id',
    role: 'siswa',
    lastLogin: '2024-04-02 10:05',
  },
  {
    id: '5',
    name: 'Andi Alumni',
    email: 'alumni@sistren.sch.id',
    role: 'alumni',
    lastLogin: '2024-03-30 11:45',
  },
]

export const MOCK_ACADEMIC_RECORDS: AcademicRecord[] = [
  { semester: 'Sem 1', gpa: 3.85, credits: 20 },
  { semester: 'Sem 2', gpa: 3.92, credits: 22 },
  { semester: 'Sem 3', gpa: 3.78, credits: 21 },
  { semester: 'Sem 4', gpa: 3.95, credits: 24 },
  { semester: 'Sem 5', gpa: 3.88, credits: 20 },
]

export const MOCK_COURSES: Course[] = [
  { id: 'TK101', name: 'Pemrograman Dasar', credits: 3, grade: 'A', semester: 'Gasal 2023/2024' },
  { id: 'TK102', name: 'Matematika Diskrit', credits: 3, grade: 'A-', semester: 'Gasal 2023/2024' },
  { id: 'TK103', name: 'Struktur Data', credits: 4, grade: 'A', semester: 'Gasal 2023/2024' },
  { id: 'TK104', name: 'Basis Data', credits: 3, grade: 'B+', semester: 'Gasal 2023/2024' },
  { id: 'TK105', name: 'Jaringan Komputer', credits: 3, grade: 'A', semester: 'Gasal 2023/2024' },
]

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Libur Awal Puasa',
    content: 'Diberitahukan kepada seluruh siswa bahwa kegiatan belajar mengajar diliburkan selama 3 hari awal puasa.',
    date: '2026-04-05',
    author: 'Admin TU',
    category: 'umum',
  },
  {
    id: '2',
    title: 'Jadwal Ujian Tengah Semester',
    content: 'Ujian Tengah Semester (UTS) akan dilaksanakan pada tanggal 15-20 April 2026. Mohon persiapkan diri dengan baik.',
    date: '2026-04-02',
    author: 'Bagian Akademik',
    category: 'akademik',
  },
  {
    id: '3',
    title: 'Pembayaran SPP Bulan April',
    content: 'Batas akhir pembayaran SPP bulan April adalah tanggal 10 April 2026. Harap segera melakukan pembayaran.',
    date: '2026-04-01',
    author: 'Bagian Keuangan',
    category: 'keuangan',
  },
]
