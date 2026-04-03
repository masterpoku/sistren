export type UserRole =
  | 'superadmin'
  | 'administrator'
  | 'guru'
  | 'siswa'
  | 'alumni';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  studentId?: string;
  employeeId?: string;
  faculty?: string;
  major?: string;
  graduationYear?: string;
}

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
};

export const MOCK_USER = MOCK_ACCOUNTS['siswa@sistren.sch.id'];

export interface UserManagement {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin: string;
}

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
];
