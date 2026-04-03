export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  subject: string;
  email: string;
  status: 'aktif' | 'cuti' | 'pensiun';
}

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
];
